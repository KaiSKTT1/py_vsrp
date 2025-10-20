# backend/main.py
from fastapi import FastAPI, UploadFile, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import tempfile, os, shutil, json, math, hashlib
from threading import Lock
from cvrp_solver_api import solve_cvrp_api

# Khởi tạo thư mục cache và lock
CACHE_DIR = os.path.join(os.path.dirname(__file__), "cache_routes")
os.makedirs(CACHE_DIR, exist_ok=True)
cache_lock = Lock()

app = FastAPI(title="CVRP Solver API", version="1.3")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_methods=["*"],
    allow_headers=["*"],
)


def cache_key(start: str, end: str) -> str:
    return hashlib.md5(f"{start}-{end}".encode()).hexdigest()

def load_from_cache(start: str, end: str):
    key = cache_key(start, end)
    path = os.path.join(CACHE_DIR, f"{key}.json")
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except json.JSONDecodeError:
            return None
    return None

def save_to_cache(start: str, end: str, data):
    key = cache_key(start, end)
    path = os.path.join(CACHE_DIR, f"{key}.json")
    with cache_lock:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f)

def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Tính khoảng cách giữa 2 điểm GPS (mét)"""
    R = 6371000  # Bán kính Trái Đất (mét)
    
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lng2 - lng1)
    
    a = math.sin(delta_phi/2)**2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c

def get_route_response(start: str, end: str):
    """Tính toán và trả về thông tin tuyến đường dựa trên khoảng cách Haversine"""
    try:
        # Chuyển đổi chuỗi coordinates "lng,lat" thành float
        lng1, lat1 = map(float, start.split(","))
        lng2, lat2 = map(float, end.split(","))
        
        distance = haversine_distance(lat1, lng1, lat2, lng2)
        
        # Tạo GeoJSON response
        return {
            "type": "FeatureCollection",
            "features": [{
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": [[lng1, lat1], [lng2, lat2]]
                },
                "properties": {
                    "segments": [{
                        "distance": distance,
                        "duration": distance / 13.89  # Ước tính tốc độ trung bình 50km/h = 13.89m/s
                    }]
                }
            }]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Lỗi xử lý tọa độ: {str(e)}")



@app.get("/route")
def get_route(
    start: str = Query(..., description="Tọa độ bắt đầu 'lng,lat'"),
    end: str = Query(..., description="Tọa độ kết thúc 'lng,lat'")
):
    """Tính toán tuyến đường giữa hai điểm bằng phương pháp Haversine"""
    return get_route_response(start, end)

@app.post("/solve_cvrp")
async def solve_cvrp(
    file: UploadFile,
    vehicle_count: int = Form(...),
    vehicle_capacity: int = Form(...),
):
    """Giải bài toán CVRP từ file CSV."""
    import traceback

    suffix = os.path.splitext(file.filename or "")[1].lower()
    if suffix != ".csv":
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ upload file CSV.")

    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    shutil.copyfileobj(file.file, tmp)
    tmp.close()

    try:
        result = solve_cvrp_api(tmp.name, int(vehicle_count), int(vehicle_capacity))
        return JSONResponse(content=result)

    except Exception as e:
        print("Lỗi khi xử lý CVRP:")
        traceback.print_exc()   # In stack trace ra terminal
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if os.path.exists(tmp.name):
            try:
                os.remove(tmp.name)
            except Exception:
                pass

