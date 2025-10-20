import pandas as pd
import math
from ortools.constraint_solver import pywrapcp, routing_enums_pb2

# Hàm tính ma trận với mô hình 2D
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

# Khoảng cách Haversine giữa hai điểm có tọa độ GPS (vĩ độ/kinh độ) trên bề mặt Trái Đất.
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

# Hàm để giải quyết các mọi vấn đề
def solve_cvrp_with_config(distance_matrix, demands, vehicle_count, vehicle_capacity, 
                           time_limit_s, strategy):
    """Hàm helper để giải CVRP với config cụ thể"""
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
    search_params.first_solution_strategy = strategy
    search_params.time_limit.seconds = time_limit_s

    solution = routing.SolveWithParameters(search_params)
    
    if not solution:
        return None
    
    # ✅ FIX 1: Logic lọc route đúng
    routes = []
    total_distance = 0
    
    for v in range(data["num_vehicles"]):
        idx = routing.Start(v)
        route = []
        route_distance = 0
        
        while not routing.IsEnd(idx):
            node = manager.IndexToNode(idx)
            route.append(node)
            next_idx = solution.Value(routing.NextVar(idx))
            route_distance += routing.GetArcCostForVehicle(idx, next_idx, v)
            idx = next_idx
        
        route.append(0)  # Thêm depot cuối
        
        # ✅ Chỉ thêm route có ít nhất 1 điểm giao hàng (không chỉ depot)
        if len(route) > 2:  # [0, điểm_giao_hàng, 0]
            routes.append({
                "route": route,
                "distance": route_distance,
                "load": sum(demands[node] for node in route if node != 0)
            })
            total_distance += route_distance
    
    return {
        "routes": routes,
        "total_distance": total_distance,
        "vehicles_used": len(routes)
    }

# Hàm đưa ra nhận dịnh
def solve_cvrp_api(csv_path, vehicle_count=None, vehicle_capacity=100, time_limit_s=60):
    df = pd.read_csv(csv_path)
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

    if "demand" not in df.columns:
        raise ValueError("CSV thiếu cột 'demand'.")

    demands = df["demand"].fillna(0).astype(int).tolist()
    total_demand = sum(demands)

    # Tự tính số xe ban đầu
    if not vehicle_count or vehicle_count <= 0:
        vehicle_count = math.ceil(total_demand / vehicle_capacity)
        print(f"Tự động tính số xe: {vehicle_count}")

    # Tính ma trận khoảng cách
    if data_type == "augerat":
        distance_matrix = compute_euclidean_distance_matrix(locations)
    else:
        distance_matrix = compute_real_distance_matrix(locations)

    # ✅ FIX 2: Fallback Strategy
    strategies = [
        ("PATH_CHEAPEST_ARC", routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC),
        ("PARALLEL_CHEAPEST_INSERTION", routing_enums_pb2.FirstSolutionStrategy.PARALLEL_CHEAPEST_INSERTION),
        ("LOCAL_CHEAPEST_INSERTION", routing_enums_pb2.FirstSolutionStrategy.LOCAL_CHEAPEST_INSERTION),
        ("GLOBAL_CHEAPEST_ARC", routing_enums_pb2.FirstSolutionStrategy.GLOBAL_CHEAPEST_ARC),
    ]
    
    attempts = [
        # (số_xe, time_limit, strategy_name, strategy_enum)
        (vehicle_count, time_limit_s, strategies[0][0], strategies[0][1]),
        (vehicle_count, time_limit_s * 2, strategies[0][0], strategies[0][1]),  # Tăng thời gian
        (int(vehicle_count * 0.95), time_limit_s * 2, strategies[1][0], strategies[1][1]),  # Giảm xe + đổi strategy
        (int(vehicle_count * 1.1), time_limit_s, strategies[2][0], strategies[2][1]),  # Tăng xe
        (vehicle_count, time_limit_s * 3, strategies[3][0], strategies[3][1]),  # Thời gian dài + strategy khác
    ]
    
    best_solution = None
    
    for attempt_num, (vc, tl, strat_name, strat_enum) in enumerate(attempts, 1):
        if vc <= 0:
            continue
            
        print(f"\n🔄 Thử lần {attempt_num}/{len(attempts)}: {vc} xe, {tl}s, {strat_name}")
        
        result = solve_cvrp_with_config(
            distance_matrix, demands, vc, vehicle_capacity, tl, strat_enum
        )
        
        if result:
            print(f"✅ Tìm thấy lời giải: {result['vehicles_used']} xe, {result['total_distance']/1000:.2f} km")
            
            # Lưu lời giải tốt nhất (ít xe nhất, hoặc cùng số xe thì khoảng cách ngắn hơn)
            if not best_solution or \
               result['vehicles_used'] < best_solution['vehicles_used'] or \
               (result['vehicles_used'] == best_solution['vehicles_used'] and 
                result['total_distance'] < best_solution['total_distance']):
                best_solution = result
                best_solution['config'] = {
                    'vehicle_count': vc,
                    'time_limit': tl,
                    'strategy': strat_name
                }
            
            # Nếu đã tìm được lời giải tốt, dừng sớm
            if result['vehicles_used'] <= math.ceil(total_demand / vehicle_capacity):
                print("✨ Đạt số xe tối ưu, dừng tìm kiếm")
                break
        else:
            print(f"❌ Không tìm thấy lời giải")
    
    if not best_solution:
        return {
            "error": "Không tìm thấy lời giải sau tất cả các lần thử",
            "vehicle_count": vehicle_count,
            "total_demand": total_demand,
            "attempts": len(attempts)
        }
    
    # Chuẩn bị response cuối cùng
    return {
        "routes": [r["route"] for r in best_solution["routes"]],
        "route_details": best_solution["routes"],  # Thông tin chi tiết từng route
        "locations": locations,
        "demands": demands,
        "vehicle_capacity": vehicle_capacity,
        "vehicle_count": best_solution['config']['vehicle_count'],
        "vehicles_used": best_solution['vehicles_used'],
        "total_demand": total_demand,
        "total_distance": best_solution['total_distance'],
        "type": data_type,
        "distance_matrix": distance_matrix,
        "config_used": best_solution['config']
    }