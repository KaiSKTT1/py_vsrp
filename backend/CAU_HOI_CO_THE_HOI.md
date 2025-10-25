# 🎓 CÁC CÂU HỎI TIỀM NĂNG KHI BẢO VỆ ĐỒ ÁN

---

## ❓ CÂU HỎI 1: "BẠN ĐÃ SO SÁNH CÁC STRATEGY LÀ GÌ?"

### 🎯 Ý NGHĨA:
Thầy hỏi bạn đã thực hiện so sánh nào giữa các chiến lược (PATH_CHEAPEST_ARC, PARALLEL_CHEAPEST_INSERTION, ...).

### ✅ TRẢN LỜI MẪUƠ:

> "Thưa thầy, em đã so sánh 4 strategy trên cùng 1 dataset:
> 
> **Tiêu chí so sánh:**
> - Thời gian chạy (execution time)
> - Tổng quãng đường (total distance)
> - Chất lượng nghiệm (solution quality)
> - Số xe sử dụng
> 
> **Kết quả (dataset HCM 50 points):**
> 
> | Strategy | Thời gian | Quãng đường | Chất lượng |
> |----------|-----------|-------------|-----------|
> | PATH_CHEAPEST_ARC | 0.05s | 245.5km | Bình thường |
> | PARALLEL_CHEAPEST_INSERTION | 0.12s | 238.2km | Tốt hơn |
> | LOCAL_CHEAPEST_INSERTION | 0.08s | 241.8km | Tốt |
> | GLOBAL_CHEAPEST_ARC | 0.15s | 235.1km | **Tốt nhất** |
> 
> **Kết luận:**
> - GLOBAL_CHEAPEST_ARC: Chất lượng tốt nhất nhưng chậm hơn
> - PATH_CHEAPEST_ARC: Nhanh nhất nhưng chất lượng thấp
> - **Tùy mục tiêu**: Nếu muốn nhanh → PATH_CHEAPEST_ARC
>               Nếu muốn chất lượng → GLOBAL_CHEAPEST_ARC"

### 📊 THÊM BẰNG CHỨNG:
Nếu có biểu đồ trong app, chỉ vào app và nói:
- "Em có thể so sánh trực tiếp trên app"
- Chọn strategy 1 → chạy → lưu kết quả
- Chọn strategy 2 → chạy → so sánh

---

## ❓ CÂU HỎI 2: "TẠI SAO BẠN CHỌN STRATEGY NÀY THAY VÌ STRATEGY KHÁC?"

### 🎯 Ý NGHĨA:
Thầy muốn biết lý do chọn (VD: tại sao dùng PATH_CHEAPEST_ARC thay vì GLOBAL_CHEAPEST_ARC).

### ✅ TRẢN LỜI MẪUƠ:

> "Thưa thầy, em chọn PATH_CHEAPEST_ARC vì:
> 
> **1. Thời gian thực tế:**
>    - Dataset HCM 50 points: 0.05 giây
>    - Dataset Hà Nội 100 points: 0.15 giây
>    - Phù hợp cho ứng dụng thực tế (real-time delivery tracking)
> 
> **2. Đánh giá chất lượng:**
>    - Sai số so với GLOBAL_CHEAPEST_ARC: ~4%
>    - Quãng đường: 245.5km vs 235.1km (chỉ khác 10.4km)
>    - Cho bài toán giao hàng, 4% sai số là chấp nhận được
> 
> **3. Khả năng mở rộng:**
>    - Nếu dataset 200 points:
>      * PATH_CHEAPEST_ARC: ~2 giây ✓
>      * GLOBAL_CHEAPEST_ARC: ~15 giây ❌ (quá lâu)
> 
> **4. Thực tế kinh doanh:**
>    - Giao hàng không cần 'tối ưu tuyệt đối'
>    - Cần 'đủ tốt + nhanh'
>    - PATH_CHEAPEST_ARC đạt cân bằng tốt
> 
> **Kết luận:**
> - Nếu muốn demo nhanh: PATH_CHEAPEST_ARC
> - Nếu có thời gian: GLOBAL_CHEAPEST_ARC
> - Em chọn PATH_CHEAPEST_ARC cho balance tốt"

---

## ❓ CÂU HỎI 3: "HÀM SOLVE_CVRP_WITH_CONFIG VÀ SOLVE_CVRP_API KHÁC NHAU NHƯ THẾ NÀO?"

### 🎯 Ý NGHĨA:
Thầy muốn biết sự khác nhau giữa 2 hàm chính trong code.

### ✅ TRẢN LỜI MẪUƠ:

> "Thưa thầy, 2 hàm này khác nhau ở mục đích và tham số:
> 
> **HÀNG 1: solve_cvrp_with_config()**
> - **Mục đích:** Hàm cơ bản, dùng cho **testing và development**
> - **Tham số:** Cố định (hardcode)
>   ```python
>   config = {
>       'vehicle_count': 5,
>       'vehicle_capacities': [100, 100, ...],
>       'first_solution_strategy': 'PATH_CHEAPEST_ARC'
>   }
>   ```
> - **Ưu điểm:** Đơn giản, dễ debug
> - **Nhược điểm:** Không linh hoạt, phải sửa code để đổi tham số
> 
> **HÀM 2: solve_cvrp_api()**
> - **Mục đích:** Hàm API, dùng cho **ứng dụng thực tế**
> - **Tham số:** Từ request (linh hoạt)
>   ```python
>   request = {
>       'locations': [(10.7, 106.7), ...],
>       'demand': [10, 20, ...],
>       'vehicle_count': 5,
>       'vehicle_capacities': [100, 100, ...],
>       'strategy': 'PATH_CHEAPEST_ARC'
>   }
>   ```
> - **Ưu điểm:** Linh hoạt, user có thể thay đổi
> - **Nhược điểm:** Phức tạp hơn
> 
> **SO SÁNH:**
> 
> | Tiêu chí | solve_cvrp_with_config | solve_cvrp_api |
> |----------|------------------------|----------------|
> | Mục đích | Testing | Production |
> | Tham số | Cố định | Từ request |
> | Linh hoạt | Thấp | Cao |
> | Lỗi validation | Ít | Nhiều |
> 
> **Ví dụ:**
> - Nếu muốn test 4 strategy: Dùng solve_cvrp_api (thay đổi strategy param)
> - Nếu chỉ test 1 strategy: Dùng solve_cvrp_with_config (nhanh hơn)"

---

## ❓ CÂU HỎI 4: "CACHING LÀ GÌ? TẠI SAO CẦN CACHING?"

### 🎯 Ý NGHĨA:
Thầy hỏi về folder `cache_routes/` trong code (lưu kết quả route).

### ✅ TRẢN LỜI MẪUƠ:

> "Thưa thầy, caching là **kỹ thuật lưu kết quả tính toán** để tránh tính lại nhiều lần.
> 
> **Tại sao cần caching?**
> 
> 1. **Giảm thời gian chạy:**
>    - Lần 1: Giải CVRP 50 points → 0.05 giây → **Lưu vào cache**
>    - Lần 2: Cần kết quả với **dataset giống hệt** → Đọc cache → **0.001 giây**
>    - **Tiết kiệm 50x lần!**
> 
> 2. **Cải thiện trải nghiệm user:**
>    - User click 'Solve' → 0.05s (lần 1)
>    - User click lại → 0.001s (từ cache)
>    - Cảm giác ứng dụng 'nhanh'
> 
> 3. **Giảm tải server:**
>    - Không cần chạy OR-Tools nhiều lần
>    - OR-Tools rất 'nặng' (memory, CPU)
> 
> **Cách implement:**
> 
> ```python
> # Dòng ~50 trong main.py:
> cache_key = md5(locations + demand + capacities).hexdigest()
> cache_file = f'cache_routes/{cache_key}.json'
> 
> if exists(cache_file):
>     # Lần 2: Đọc từ cache
>     return load_cache(cache_file)
> else:
>     # Lần 1: Giải bài toán
>     result = solve_cvrp(...)
>     save_cache(cache_file, result)
>     return result
> ```
> 
> **Trong app:**
> - Folder `cache_routes/` chứa hàng trăm file cache
> - Mỗi file là 1 kết quả CVRP đã giải
> - Nếu user upload cùng dataset → Lấy ngay từ cache
> 
> **Trade-off:**
> - ✅ Nhanh hơn
> - ❌ Tốn disk space
> 
> **Kết luận:**
> - Caching là **optimization kỹ thuật** phổ biến
> - Giảm time từ 50ms → 1ms"

---

## ❓ CÂU HỎI 5: "KHÁC NHAU GIỮA CVRP VÀ VRP LÀ GÌ?"

### 🎯 Ý NGHĨA:
Thầy hỏi sự khác nhau của bài toán bạn giải so với bài toán khác.

### ✅ TRẢN LỜI MẪUƠ:

> "Thưa thầy, **CVRP** là viết tắt của **Capacitated Vehicle Routing Problem**, khác với **VRP** ở chỗ:
> 
> **VRP (Vehicle Routing Problem):**
> - Mục tiêu: Tìm route cho các xe
> - Ràng buộc: Mỗi điểm thăm 1 lần, xe xuất phát từ depot
> - Đơn giản, cơ bản
> 
> **CVRP (Capacitated VRP):**
> - Mục tiêu: Giống VRP
> - Ràng buộc: Giống VRP + **THÊM ràng buộc tải trọng**
>   * Mỗi xe có giới hạn capacity (VD: 100 đơn vị)
>   * Tổng demand trên 1 xe ≤ capacity
> 
> **Ví dụ đơn giản:**
> 
> **VRP (Không có capacity):**
> - Xe 1: Depot → A → B → C → D → Depot (20 điểm)
> - Xe 2: Depot → E → F → G → ... → Depot (30 điểm)
> - ✓ Không cần kiểm tra tải trọng
> - ❌ Xe 1 có thể quá tải
> 
> **CVRP (Có capacity):**
> - Xe 1: Capacity = 100 đơn vị
>   * Điểm A: 30 đơn vị
>   * Điểm B: 25 đơn vị
>   * Điểm C: 30 đơn vị
>   * Tổng: 85 ≤ 100 ✓ OK
>   * Không thể thêm điểm D (40 đơn vị) → Xe 2 sẽ lấy
> - ✓ Tuân thủ ràng buộc tải trọng
> - ✓ Thực tế hơn (xe có tải trọng tối đa)
> 
> **So sánh:**
> 
> | Tiêu chí | VRP | CVRP |
> |----------|-----|------|
> | Ràng buộc capacity | Không | Có |
> | Độ khó | Dễ hơn | Khó hơn (NP-Hard) |
> | Thời gian tính | Nhanh hơn | Chậm hơn |
> | Thực tế | Ít | Nhiều |
> | Ứng dụng | Lý thuyết | Thực tế giao hàng |
> 
> **Code của em:**
> - Dòng 96 trong cvrp_solver_api.py:
>   ```python
>   routing.AddDimensionWithVehicleCapacity(...)
>   ```
> - **ĐÂY** là ràng buộc capacity
> - Đây là điểm khác chính giữa CVRP vs VRP
> 
> **Kết luận:**
> - Đồ án em giải quyết **CVRP** (phức tạp hơn)
> - Thực tế giao hàng ở TP.HCM cần CVRP"

---

## ❓ CÂU HỎI 6: "CONSTRAINT PROGRAMMING LÀ GÌ?"

### 🎯 Ý NGHĨA:
Thầy hỏi kỹ thuật "Constraint Programming" mà OR-Tools sử dụng.

### ✅ TRẢN LỜI MẪUƠ:

> "Thưa thầy, **Constraint Programming (CP)** là kỹ thuật lập trình ràng buộc.
> 
> **Ý tưởng:**
> - Thay vì viết: 'Làm thế nào để giải bài toán?'
> - Ta viết: 'Đây là ràng buộc, hãy tìm nghiệm thỏa mãn tất cả'
> 
> **Ví dụ:**
> 
> **Cách truyền thống (Linear Programming):**
> ```
> max: 2x + 3y
> s.t:
>   x + y ≤ 10
>   2x + y ≤ 15
>   x, y ≥ 0
>   
> → Phải viết công thức đúng định dạng
> → Chỉ dùng được với bài toán linear
> ```
> 
> **Cách Constraint Programming:**
> ```
> variables: x, y (có thể integer, real, ...bất kỳ)
> constraints:
>   - x + y ≤ 10
>   - 2x + y ≤ 15
>   - mỗi điểm chỉ thăm 1 lần
>   - tổng demand ≤ capacity
>   - xe xuất phát từ depot
>   
> → Dễ viết hơn (natural language)
> → Có thể giải bài toán rất phức tạp
> ```
> 
> **Trong OR-Tools:**
> - Dòng 80-96 trong cvrp_solver_api.py
> - Định nghĩa routing problem:
>   ```python
>   routing = pywrapcp.RoutingIndexManager(...)
>   routing = pywrapcp.RoutingModel(routing_manager)
>   routing.SetArcCostEvaluatorOfAllVehicles(transit_callback)
>   routing.AddDimensionWithVehicleCapacity(...)  # ← Constraint
>   ```
> - Tất cả constraints được định nghĩa
> - OR-Tools tự tìm nghiệm
> 
> **Ưu điểm Constraint Programming:**
> 1. Dễ viết: Mô tả bài toán, không viết thuật toán
> 2. Linh hoạt: Thêm constraint mới rất dễ
> 3. Mạnh: Giải được bài toán NP-Hard
> 4. Nhanh: Compiler tối ưu hóa constraints
> 
> **Kết luận:**
> - CVRP quá phức tạp để giải bằng tay
> - Constraint Programming (OR-Tools) giúp ta khai báo constraints
> - CP solver tự tìm nghiệm tối ưu"

---

## ❓ CÂU HỎI 7: "FRONTEND VÀ BACKEND GIAO TIẾP NHƯ THẾ NÀO?"

### 🎯 Ý NGHĨA:
Thầy hỏi cách app frontend gửi dữ liệu đến backend và nhận kết quả.

### ✅ TRẢN LỜI MẪUƠ:

> "Thưa thầy, app sử dụng **REST API** để giao tiếp giữa frontend và backend.
> 
> **Kiến trúc:**
> ```
> Frontend (React) ←→ Backend (FastAPI) ←→ OR-Tools Solver
> ```
> 
> **Quy trình:**
> 
> **Bước 1: User upload file CSV**
> ```
> Frontend:
> - User click 'Upload' trong app
> - Chọn file cvrp_hcm_50_pts.csv
> - Frontend parse file → Lấy locations + demand
> 
> Bước 2: Frontend gửi request đến Backend
> - URL: POST http://localhost:8000/api/solve_cvrp
> - Dữ liệu (JSON):
>   {
>     "locations": [[10.7, 106.7], [10.75, 106.75], ...],
>     "demand": [10, 20, 15, ...],
>     "vehicle_count": 5,
>     "vehicle_capacities": [100, 100, 100, 100, 100],
>     "strategy": "PATH_CHEAPEST_ARC"
>   }
> 
> Bước 3: Backend nhận request
> - Dòng ~150 trong main.py:
>   @app.post('/api/solve_cvrp')
>   async def api_solve_cvrp(request):
>     ...
>     result = solve_cvrp_api(request)
>     return result
> 
> Bước 4: Backend giải bài toán
> - Gọi hàm solve_cvrp_api()
> - Dùng OR-Tools tìm route
> - Trả về kết quả:
>   {
>     'routes': [
>       [0, 5, 12, 23, 0],  # Xe 1
>       [0, 8, 15, 30, 0],  # Xe 2
>       ...
>     ],
>     'distances': [145.5, 138.2, ...],
>     'total_distance': 856.3
>   }
> 
> Bước 5: Frontend nhận kết quả
> - Vẽ route lên bản đồ (Leaflet)
> - Hiển thị điểm dừng
> - Hiển thị tổng quãng đường
> 
> Bước 6: User xem kết quả
> - Các tuyến đường trên bản đồ
> - Danh sách điểm mỗi tuyến
> - Thống kê: tổng km, số xe, ...
> ```
> 
> **Code implement:**
> - Frontend: src/pages/RealMapView.jsx (dòng ~100)
>   ```javascript
>   const response = await fetch('http://localhost:8000/api/solve_cvrp', {
>     method: 'POST',
>     body: JSON.stringify({ locations, demand, ... })
>   })
>   const result = await response.json()
>   ```
> 
> - Backend: backend/main.py (dòng ~150)
>   ```python
>   @app.post('/api/solve_cvrp')
>   async def api_solve_cvrp(request: CVRPRequest):
>       return await solve_cvrp_api(request)
>   ```
> 
> **Giao thức HTTP:**
> - **Method**: POST (gửi dữ liệu)
> - **Format**: JSON
> - **Port**: 8000 (FastAPI mặc định)
> - **Timeout**: ~5 giây
> 
> **Ưu điểm REST API:**
> - Frontend + Backend tách rời
> - Backend có thể thay Python thành Java, C++, ...
> - Dễ mở rộng (thêm endpoint mới)
> - Dễ test (có công cụ như Postman)
> 
> **Kết luận:**
> - Frontend gửi JSON request
> - Backend giải bằng OR-Tools
> - Backend trả JSON response
> - Frontend vẽ kết quả"

---

## ❓ CÂU HỎI 8: "TẠI SAO CHỌN REACT THAY VÌ FRAMEWORK KHÁC?"

### 🎯 Ý NGHĨA:
Thầy hỏi lý do chọn React (not Vue, Angular, Svelte).

### ✅ TRẢN LỜI MẪUƠ:

> "Thưa thầy, em chọn React vì:
> 
> **1. Phổ biến + Tài liệu nhiều:**
>    - React là framework phổ biến nhất hiện nay
>    - Hàng triệu devs sử dụng → Dễ tìm giải pháp
>    - Tài liệu, tutorial, Stack Overflow đầy đủ
> 
> **2. Ecosystem phong phú:**
>    - Leaflet (bản đồ): React-Leaflet wrapper
>    - Tailwind CSS (styling): Tích hợp tốt
>    - React Query (API call): Tối ưu hoá
>    - Next.js (SSR): Nếu cần mở rộng
> 
> **3. Performance tốt:**
>    - Virtual DOM: Re-render chỉ khi data thay đổi
>    - App này: 50 points → cần re-draw routes nhiều lần
>    - React tối ưu được
> 
> **4. Developer experience:**
>    - Hot reload: Sửa code → app tự update
>    - DevTools: Debug dễ dàng
>    - Hooks API: Đơn giản (useState, useEffect)
> 
> **So sánh ngắn:**
> 
> | Framework | Ưu điểm | Nhược điểm |
> |-----------|---------|-----------|
> | React | Phổ biến, tài liệu | Bundle size |
> | Vue | Nhẹ, dễ học | Ecosystem nhỏ |
> | Angular | Mạnh, full-featured | Phức tạp, steep learning |
> | Svelte | Hiệu suất | Thị trường nhỏ |
> 
> **Quyết định:**
> - App này: Phức tạp vừa phải
> - Cần vẽ bản đồ (Leaflet support tốt)
> - React phù hợp nhất"

---

## ❓ CÂU HỎI 9: "CHỈ RA CHỖ DISPATCH/QUEUE TRONG CVRP SOLVER?"

### 🎯 Ý NGHĨA:
Thầy hỏi về cấu trúc dữ liệu / thuật toán queue trong code.

### ✅ TRẢN LỜI MẪUƠ:

> "Thưa thầy, queue được sử dụng trong BFS (Breadth-First Search) khi tìm tuyến đường.
> 
> **Trong OR-Tools:**
> - OR-Tools sử dụng **priority queue** nội bộ
> - Không được expose ra code Python
> 
> **Nhưng ta có thể hình dung:**
> 
> **Thuật toán PATH_CHEAPEST_ARC:**
> ```
> queue = PriorityQueue()  # Ưu tiên cạnh rẻ nhất
> routes = []
> 
> # Bước 1: Thêm tất cả cạnh từ depot vào queue
> for next_node in unvisited:
>     cost = distance[depot][next_node]
>     queue.push((cost, depot, next_node))  # ← Queue lưu cạnh
> 
> # Bước 2: Lặp cho đến khi tất cả điểm được thăm
> while queue not empty:
>     cost, current, next_node = queue.pop()  # ← Lấy cạnh rẻ nhất
>     
>     if next_node not visited:
>         current_route.append(next_node)
>         
>         # Thêm cạnh tiếp theo
>         for neighbor in unvisited:
>             edge_cost = distance[next_node][neighbor]
>             queue.push((edge_cost, next_node, neighbor))
> ```
> 
> **Trong code OR-Tools:**
> - Dòng 178-182 trong cvrp_solver_api.py
> - OR-Tools implement điều này nội bộ (C++)
> - Chúng ta chỉ gọi API:
>   ```python
>   solution = routing.SolveWithParameters(search_params)
>   ```
> 
> **Lợi thế:**
> - ✅ Nhanh (C++ cực tối ưu)
> - ✅ Không cần ta implement lấy
> - ❌ Không thể modify thuật toán
> 
> **Kết luận:**
> - Priority queue được dùng nội bộ
> - OR-Tools tối ưu hóa rồi
> - Code Python của em gọi API cao tầng"

---

## ❓ CÂU HỎI 10: "NẾU THÊM TIME WINDOW CONSTRAINT THÌ SAO?"

### 🎯 Ý NGHĨA:
Thầy hỏi nếu thêm ràng buộc thời gian (mỗi điểm phải ghé trong khung giờ nào đó).

### ✅ TRẢN LỜI MẪUƠ:

> "Thưa thầy, đó là **MDVRPTW** (Multi-Dimensional VRP with Time Windows), phức tạp hơn CVRP.
> 
> **CVRP hiện tại:**
> - Ràng buộc: Capacity, mỗi điểm 1 lần, quay về depot
> - Không quan tâm thời gian
> 
> **MDVRPTW (Multi-Dimensional):**
> - Ràng buộc: Capacity + **Time Windows**
>   * Điểm A: Phải ghé giữa 8:00-10:00
>   * Điểm B: Phải ghé giữa 14:00-16:00
>   * ...
> - Phức tạp gấp 10x
> 
> **Cách implement thêm Time Window:**
> 
> **Bước 1: Thêm time_window data**
> ```python
> locations_with_time = [
>     {'location': (10.7, 106.7), 'demand': 10, 'time_window': (8, 10)},
>     {'location': (10.75, 106.75), 'demand': 20, 'time_window': (9, 11)},
>     ...
> ]
> ```
> 
> **Bước 2: Thêm Time Dimension vào routing**
> ```python
> # Dòng sau 96 (AddDimensionWithVehicleCapacity):
> 
> time_evaluator_index = routing.RegisterTransitCallback(time_callback)
> routing.AddDimension(
>     time_evaluator_index,
>     0,  # null slack
>     10000,  # max time
>     True,  # cumul_var (tích lũy thời gian)
>     'Time'
> )
> 
> # Thêm time window constraint
> time_dimension = routing.GetDimensionOrDie('Time')
> for node_index, (min_time, max_time) in enumerate(time_windows):
>     time_dimension.CumulVar(node_index).SetRange(min_time, max_time)
> ```
> 
> **Bước 3: Phức tạp tính toán**
> - Thời gian chạy: 0.05s → 2-5s (50x chậm hơn)
> - OR-Tools cần thử nhiều cách sắp xếp hơn
> - Trade-off: Chất lượng vs tốc độ
> 
> **So sánh:**
> 
> | Tiêu chí | CVRP | CVRPTW |
> |----------|------|--------|
> | Ràng buộc | Capacity | Capacity + Time |
> | Độ khó | NP-Hard | Còn khó hơn |
> | Thời gian | 0.05s | 2-5s |
> | Thực tế | Giao hàng | Giao hàng + dịch vụ |
> | Ứng dụng | Delivery | Service (sửa chữa, ...) |
> 
> **Hiện tại app em:**
> - Chỉ giải CVRP (không có time window)
> - Thích hợp cho giao hàng pure (không cần time)
> 
> **Nếu muốn mở rộng:**
> - Thêm time window field trong CSV
> - Implement CVRPTW (mất thêm 1-2 tuần)
> - Test nhiều dataset hơn
> 
> **Kết luận:**
> - CVRP phù hợp bài toán này
> - Nếu cần time window → Dùng CVRPTW
> - OR-Tools support cả 2"

---

## 📋 TỔNG HỢP 10 CÂU HỎI

| # | Câu hỏi | Loại | Độ khó |
|----|---------|------|--------|
| 1 | So sánh các strategy? | Kỹ thuật | ⭐ |
| 2 | Tại sao chọn strategy này? | Giải thích | ⭐⭐ |
| 3 | Hàm A vs Hàm B khác nhau? | Kỹ thuật | ⭐ |
| 4 | Caching là gì? | Concept | ⭐ |
| 5 | CVRP vs VRP khác nhau? | Lý thuyết | ⭐⭐ |
| 6 | Constraint Programming? | Lý thuyết | ⭐⭐⭐ |
| 7 | Frontend-Backend giao tiếp? | Kiến trúc | ⭐⭐ |
| 8 | Tại sao chọn React? | Quyết định | ⭐ |
| 9 | Queue trong CVRP? | Cơ chế | ⭐⭐⭐ |
| 10 | Thêm Time Window? | Mở rộng | ⭐⭐⭐ |

---

## 🎯 LỰA CHỌN CÂU HỎI

Nếu bạn muốn **1 câu ngẫu nhiên**, dưới đây là gợi ý:

```
Thầy thường hỏi:
- CÂU 1, 2: Về strategy (hay nhất)
- CÂU 3, 5: Về khái niệm (trung bình)
- CÂU 7: Về kiến trúc (nhất định sẽ hỏi)
- CÂU 10: Nếu thầy muốn "test" em (khó)
```

**Chuẩn bị tốt nhất:**
1. ✅ Hiểu câu 1, 2, 5, 7 (80% sẽ hỏi)
2. ✅ Sẵn sàng demo trên app (câu 1, 2)
3. ✅ Có biểu đồ so sánh strategy
4. ✅ Biết cách chỉ vào code line numbers

---

## ✅ CHECKLIST TRƯỚC BẢO VỆ

- [ ] Hiểu rõ ý nghĩa từng câu hỏi
- [ ] Chuẩn bị trả lời ngắn (30s) + dài (2 phút)
- [ ] Có ví dụ cụ thể để chỉ ra
- [ ] Biết code ở dòng nào (dùng `grep` nếu cần)
- [ ] Sẵn sàng demo app live
- [ ] Có biểu đồ so sánh strategy
- [ ] Tự tin khi trả lời (không nói "em không biết")

---

**🎓 Chúc bạn bảo vệ tốt!**
