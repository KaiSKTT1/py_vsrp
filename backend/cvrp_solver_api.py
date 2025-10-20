import pandas as pd
import math
from ortools.constraint_solver import pywrapcp, routing_enums_pb2

# Hàm tính ma trận với mô hình 2D:))
def compute_euclidean_distance_matrix(locations):
    size = len(locations)
    dist = [[0]*size for _ in range(size)]
    for i in range(size):
        xi, yi = locations[i]
        for j in range(size):
            if i == j:
                continue
            xj, yj = locations[j]
            dist[i][j] = int(math.hypot(xi - xj, yi - yj))
    return dist

def haversine_distance(lat1, lng1, lat2, lng2):
    """Tính khoảng cách giữa 2 điểm GPS (mét)"""
    R = 6371000  # Bán kính Trái Đất (mét)
    
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lng2 - lng1)
    
    a = math.sin(delta_phi/2)**2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return int(R * c)

def compute_haversine_distance_matrix(locations):
    """Tính ma trận khoảng cách GPS không cần API"""
    size = len(locations)
    dist = [[0]*size for _ in range(size)]
    
    for i in range(size):
        lat1, lng1 = locations[i]
        for j in range(size):
            if i == j:
                continue
            lat2, lng2 = locations[j]
            dist[i][j] = haversine_distance(lat1, lng1, lat2, lng2)
    
    return dist

def compute_real_distance_matrix(locations):
    """Tính ma trận khoảng cách cho dữ liệu GPS thực tế bằng Haversine"""
    # Đảm bảo toạ độ là số thực
    coords = []
    for lat, lng in locations:
        try:
            lat, lng = float(lat), float(lng)
        except ValueError:
            raise ValueError(f"Toạ độ không hợp lệ: ({lat}, {lng})")
        coords.append([lat, lng])
    
    print(f"Sử dụng phương pháp Haversine cho {len(locations)} điểm")
    matrix = compute_haversine_distance_matrix(coords)
    
    # Debug: In ra vài khoảng cách mẫu
    print("\nMột số khoảng cách mẫu:")
    for i in range(min(3, len(coords))):
        for j in range(min(3, len(coords))):
            if i != j:
                print(f"Từ điểm {i} đến {j}: {matrix[i][j]/1000:.2f} km")
    
    return matrix

def solve_cvrp_api(csv_path, vehicle_count=None, vehicle_capacity=100, time_limit_s=10):
    df = pd.read_csv(csv_path)
    # Chuẩn hóa tên cột (xóa khoảng trắng, lowercase)
    df.columns = [c.strip().lower() for c in df.columns]

    # Phát hiện dữ liệu
    if {"lat", "lng"}.issubset(df.columns):
        print("Phát hiện dữ liệu bản đồ thật (lat/lng)")
        locations = df[["lat", "lng"]].astype(float).values.tolist()
        data_type = "real"
    elif {"x", "y"}.issubset(df.columns):
        print("Phát hiện dữ liệu Augerat (x/y)")
        locations = df[["x", "y"]].astype(float).values.tolist()
        data_type = "augerat"
    else:
        raise ValueError(f"CSV phải có cột (x,y) hoặc (lat,lng). Cột hiện có: {df.columns.tolist()}")

    # --- Demand ---
    if "demand" not in df.columns:
        raise ValueError("CSV thiếu cột 'demand'.")

    demands = df["demand"].fillna(0).astype(int).tolist()
    total_demand = sum(demands)

    # --- Tự tính số xe ---
    if not vehicle_count or vehicle_count <= 0:
        vehicle_count = math.ceil(total_demand / vehicle_capacity)
        print(f"Tự động tính số xe: {vehicle_count}")

    # --- Khoảng cách ---
    if data_type == "augerat":
        distance_matrix = compute_euclidean_distance_matrix(locations)
    else:
        distance_matrix = compute_real_distance_matrix(locations)

    # --- OR-Tools setup ---
    data = {
        "distance_matrix": distance_matrix,
        "demands": demands,
        "vehicle_capacities": [vehicle_capacity] * vehicle_count,
        "num_vehicles": vehicle_count,
        "depot": 0,
    }

    manager = pywrapcp.RoutingIndexManager(len(distance_matrix), data["num_vehicles"], data["depot"])
    routing = pywrapcp.RoutingModel(manager)

    def dist_cb(from_index, to_index):
        return data["distance_matrix"][manager.IndexToNode(from_index)][manager.IndexToNode(to_index)]
    routing.SetArcCostEvaluatorOfAllVehicles(routing.RegisterTransitCallback(dist_cb))

    def demand_cb(from_index):
        return data["demands"][manager.IndexToNode(from_index)]
    demand_cb_idx = routing.RegisterUnaryTransitCallback(demand_cb)
    routing.AddDimensionWithVehicleCapacity(demand_cb_idx, 0, data["vehicle_capacities"], True, "Capacity")

    search_params = pywrapcp.DefaultRoutingSearchParameters()
    search_params.first_solution_strategy = routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    search_params.time_limit.seconds = time_limit_s

    solution = routing.SolveWithParameters(search_params)
    if not solution:
        return {"error": "Không tìm thấy lời giải", "vehicle_count": vehicle_count, "total_demand": total_demand}

    routes = []
    for v in range(data["num_vehicles"]):
        idx = routing.Start(v)
        route = []
        while not routing.IsEnd(idx):
            route.append(manager.IndexToNode(idx))
            idx = solution.Value(routing.NextVar(idx))
        route.append(0)
        if len(route) > 1:
            routes.append(route)

    return {
        "routes": routes,
        "locations": locations,
        "demands": demands,
        "vehicle_capacity": vehicle_capacity,
        "vehicle_count": vehicle_count,
        "total_demand": total_demand,
        "type": data_type,
        "distance_matrix": distance_matrix  # Thêm ma trận khoảng cách vào response
    }
