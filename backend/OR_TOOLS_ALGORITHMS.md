# 🔬 THUẬT TOÁN OR-TOOLS SỬ DỤNG TRONG CODE

## 📌 TÓM TẮT NHANH

OR-Tools **KHÔNG dùng 1 thuật toán duy nhất** mà là **kết hợp nhiều thuật toán** (hybrid approach):

1. **First Solution Strategy** (Heuristic) → Tìm nghiệm ban đầu
2. **Local Search** (Metaheuristic) → Cải thiện nghiệm
3. **Constraint Propagation** → Loại bỏ nghiệm không hợp lệ
4. **Branch and Bound** (Optional) → Tìm nghiệm tối ưu hơn

---

## 🎯 CHỈ RA TRONG CODE

### 1️⃣ **Vị trí khai báo thuật toán chính**

```python
# File: cvrp_solver_api.py, dòng 98-100

search_params = pywrapcp.DefaultRoutingSearchParameters()
search_params.first_solution_strategy = strategy  # ← ĐÂY: Chọn thuật toán tìm nghiệm ban đầu
search_params.time_limit.seconds = time_limit_s
```

**Giải thích:**
- `first_solution_strategy` = Thuật toán **HEURISTIC** để tìm nghiệm khả thi đầu tiên
- Giá trị `strategy` được truyền vào từ attempts (dòng 178-183)

---

### 2️⃣ **Các thuật toán được sử dụng trong code**

```python
# File: cvrp_solver_api.py, dòng 171-176

strategies = [
    ("PATH_CHEAPEST_ARC", routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC),  # ← Thuật toán 1
    ("PARALLEL_CHEAPEST_INSERTION", routing_enums_pb2.FirstSolutionStrategy.PARALLEL_CHEAPEST_INSERTION),  # ← Thuật toán 2
    ("LOCAL_CHEAPEST_INSERTION", routing_enums_pb2.FirstSolutionStrategy.LOCAL_CHEAPEST_INSERTION),  # ← Thuật toán 3
    ("GLOBAL_CHEAPEST_ARC", routing_enums_pb2.FirstSolutionStrategy.GLOBAL_CHEAPEST_ARC),  # ← Thuật toán 4
]
```

**4 thuật toán heuristic được dùng:**
1. PATH_CHEAPEST_ARC
2. PARALLEL_CHEAPEST_INSERTION
3. LOCAL_CHEAPEST_INSERTION
4. GLOBAL_CHEAPEST_ARC

---

### 3️⃣ **Nơi gọi solver (kết hợp nhiều thuật toán)**

```python
# File: cvrp_solver_api.py, dòng 102

solution = routing.SolveWithParameters(search_params)  # ← ĐÂY: Chạy solver
```

**Bên trong `SolveWithParameters()` OR-Tools làm gì:**
1. Chạy First Solution Strategy (heuristic)
2. Áp dụng Local Search để cải thiện
3. Kiểm tra constraints (capacity, time limit)
4. Trả về nghiệm tốt nhất tìm được

---

## 📚 CHI TIẾT CÁC THUẬT TOÁN

### 🔵 1. PATH_CHEAPEST_ARC (Greedy Algorithm)

**Tên đầy đủ:** Path Cheapest Arc Heuristic

**Cách hoạt động:**
```
Bước 1: Bắt đầu từ depot (điểm 0)
Bước 2: Tại mỗi bước, chọn cạnh (arc) RẺ NHẤT chưa được sử dụng
Bước 3: Thêm vào route hiện tại (nếu không vi phạm capacity)
Bước 4: Lặp lại cho đến khi hết điểm
```

**Ví dụ minh họa:**
```
Depot = 0, Điểm = [1, 2, 3]
Khoảng cách:
  0→1: 10km
  0→2: 15km
  0→3: 8km   ← RẺ NHẤT
  
Bước 1: Chọn 0→3 (8km)
Bước 2: Từ 3, chọn 3→1 (6km) ← rẻ nhất từ 3
Bước 3: Từ 1, chọn 1→2 (5km)
Bước 4: Quay về 2→0 (15km)

Route: [0, 3, 1, 2, 0]
```

**Phân loại thuật toán:**
- ✅ **Greedy Algorithm** (Tham lam)
- ✅ Complexity: O(n²)
- ❌ Không đảm bảo tối ưu toàn cục

**Chỉ ra trong code:**
```python
# Dòng 178
(vehicle_count, time_limit_s, strategies[0][0], strategies[0][1]),
# strategies[0][1] = routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
```

---

### 🟢 2. PARALLEL_CHEAPEST_INSERTION (Parallel Insertion Heuristic)

**Tên đầy đủ:** Parallel Cheapest Insertion Heuristic

**Cách hoạt động:**
```
Bước 1: Tạo route rỗng cho TẤT CẢ các xe
Bước 2: Với mỗi điểm chưa được phân:
   - Tính chi phí CHÈN vào mỗi route (ở mọi vị trí)
   - Chọn route + vị trí có chi phí thấp nhất
   - Chèn điểm vào
Bước 3: Lặp cho đến hết điểm
```

**Ví dụ minh họa:**
```
3 xe, 6 điểm [1,2,3,4,5,6]

Ban đầu:
  Xe 1: [0, _, 0]
  Xe 2: [0, _, 0]
  Xe 3: [0, _, 0]

Điểm 1: Tính chi phí chèn vào 3 route
  Xe 1: [0, 1, 0] → chi phí +20km
  Xe 2: [0, 1, 0] → chi phí +22km
  Xe 3: [0, 1, 0] → chi phí +18km ← RẺ NHẤT
  → Chọn Xe 3

Điểm 2: Tính lại
  Xe 1: [0, 2, 0] → +25km
  Xe 2: [0, 2, 0] → +20km ← RẺ NHẤT
  Xe 3: [0, 1, 2, 0] → +15km nhưng vị trí [0,2,1,0] → +16km
  → Chọn Xe 2

...
```

**Phân loại thuật toán:**
- ✅ **Insertion Heuristic** (Chèn)
- ✅ Complexity: O(n² × k) với k = số xe
- ✅ Cân bằng tải tốt
- ❌ Chậm hơn PATH_CHEAPEST_ARC

**Chỉ ra trong code:**
```python
# Dòng 180
(int(vehicle_count * 0.95), time_limit_s * 2, strategies[1][0], strategies[1][1]),
# strategies[1][1] = routing_enums_pb2.FirstSolutionStrategy.PARALLEL_CHEAPEST_INSERTION
```

---

### 🟡 3. LOCAL_CHEAPEST_INSERTION (Sequential Insertion Heuristic)

**Tên đầy đủ:** Local Cheapest Insertion Heuristic

**Cách hoạt động:**
```
Bước 1: Tạo route cho xe đầu tiên
Bước 2: Chèn các điểm vào route này cho đến khi đầy capacity
Bước 3: Chuyển sang xe tiếp theo
Bước 4: Lặp lại
```

**Ví dụ minh họa:**
```
Capacity = 100, Demand = [0, 30, 40, 50, 20, 30]

Xe 1:
  - Thêm điểm 1 (30) → load = 30
  - Thêm điểm 2 (40) → load = 70
  - Thêm điểm 4 (20) → load = 90
  - Không thể thêm điểm 3 (50) → vượt capacity
  → Route: [0, 1, 2, 4, 0]

Xe 2:
  - Thêm điểm 3 (50) → load = 50
  - Thêm điểm 5 (30) → load = 80
  → Route: [0, 3, 5, 0]
```

**Phân loại thuật toán:**
- ✅ **Sequential Insertion Heuristic** (Chèn tuần tự)
- ✅ Complexity: O(n²)
- ✅ Nhanh
- ❌ Không cân bằng tải

**Chỉ ra trong code:**
```python
# Dòng 181
(int(vehicle_count * 1.1), time_limit_s, strategies[2][0], strategies[2][1]),
# strategies[2][1] = routing_enums_pb2.FirstSolutionStrategy.LOCAL_CHEAPEST_INSERTION
```

---

### 🔴 4. GLOBAL_CHEAPEST_ARC (Global Greedy)

**Tên đầy đủ:** Global Cheapest Arc Heuristic

**Cách hoạt động:**
```
Bước 1: Xem xét TẤT CẢ các cạnh trong toàn bộ graph
Bước 2: Chọn cạnh RẺ NHẤT toàn cục (chưa dùng)
Bước 3: Thêm vào route phù hợp
Bước 4: Tính toán lại tất cả các cạnh
Bước 5: Lặp lại
```

**Ví dụ minh họa:**
```
Tất cả cạnh:
  0→1: 10km
  0→2: 15km
  0→3: 8km
  1→2: 5km  ← RẺ NHẤT TOÀN CỤC
  1→3: 6km
  2→3: 7km

Bước 1: Chọn 1→2 (5km) → Tạo route [1, 2]
Bước 2: Tính lại, chọn 0→3 (8km) ← rẻ nhất còn lại
Bước 3: Kết nối: [0, 3, ...] và [..., 1, 2]
Bước 4: Tìm cách nối 3→1 (6km)
→ Route: [0, 3, 1, 2, 0]
```

**Phân loại thuật toán:**
- ✅ **Global Greedy Algorithm** (Tham lam toàn cục)
- ✅ Cho nghiệm tốt nhất
- ❌ Chậm nhất: O(n² log n)
- ❌ Tốn nhiều bộ nhớ

**Chỉ ra trong code:**
```python
# Dòng 182
(vehicle_count, time_limit_s * 3, strategies[3][0], strategies[3][1]),
# strategies[3][1] = routing_enums_pb2.FirstSolutionStrategy.GLOBAL_CHEAPEST_ARC
```

---

## 🔄 THUẬT TOÁN BỔ SUNG (Implicit trong OR-Tools)

### 5️⃣ **Local Search (Metaheuristic)**

**Không hiện rõ trong code nhưng OR-Tools Tự động áp dụng sau First Solution**

```python
# Sau dòng 102: solution = routing.SolveWithParameters(search_params)
# OR-Tools tự động chạy Local Search
```

**Các kỹ thuật Local Search OR-Tools sử dụng:**

#### **a) 2-opt (Two-Opt Exchange)**
```
Route ban đầu: [0, 1, 2, 3, 4, 0]

Thử swap 2 cạnh:
  Xóa: 1→2 và 3→4
  Thêm: 1→3 và 2→4
  
Route mới: [0, 1, 3, 2, 4, 0]

Nếu tốt hơn → giữ lại
```

#### **b) Relocate (Di chuyển 1 điểm)**
```
Route 1: [0, 1, 2, 3, 0]
Route 2: [0, 4, 5, 0]

Di chuyển điểm 2 từ Route 1 sang Route 2:
Route 1: [0, 1, 3, 0]
Route 2: [0, 4, 2, 5, 0]

Nếu tổng distance giảm → chấp nhận
```

#### **c) Exchange (Đổi chỗ 2 điểm)**
```
Route 1: [0, 1, 2, 0]
Route 2: [0, 3, 4, 0]

Đổi điểm 2 và điểm 3:
Route 1: [0, 1, 3, 0]
Route 2: [0, 2, 4, 0]
```

#### **d) Cross (Cross-exchange)**
```
Route 1: [0, 1, 2, 3, 0]
Route 2: [0, 4, 5, 6, 0]

Cross after 2 and 5:
Route 1: [0, 1, 2, 5, 6, 0]
Route 2: [0, 4, 3, 0]
```

**Chỉ ra trong code:**
```python
# OR-Tools tự động áp dụng Local Search trong SolveWithParameters()
# Không cần code thêm, nó là built-in
```

---

### 6️⃣ **Constraint Propagation**

**Vị trí trong code:**
```python
# Dòng 96
routing.AddDimensionWithVehicleCapacity(demand_cb_idx, 0, data["vehicle_capacities"], True, "Capacity")
#                                                        ↑
#                                          CONSTRAINT PROPAGATION ở đây
```

**Cách hoạt động:**
```
Bước 1: OR-Tools tạo domain (miền giá trị) cho mỗi biến
  - Xe 1 có thể chở điểm [1, 2, 3, 4, 5, 6]
  
Bước 2: Áp dụng constraint (capacity)
  - Nếu Xe 1 đã có [1, 2] với load=70
  - Điểm 3 có demand=50 → 70+50=120 > capacity(100)
  - → Loại điểm 3 khỏi domain của Xe 1
  
Bước 3: Propagate (lan truyền)
  - Nếu chỉ Xe 2 có thể chở điểm 3
  - → Xe 2 PHẢI chở điểm 3
  - → Domain của Xe 2 thu nhỏ
```

**Ví dụ:**
```
Capacity = 100
Điểm 1: demand=40
Điểm 2: demand=50
Điểm 3: demand=60

Constraint:
  Xe không thể chở cả [1, 2, 3] vì 40+50+60=150 > 100
  
Propagation:
  Nếu Xe 1 chở [1, 2] → load=90
  → Điểm 3 PHẢI ở Xe khác
```

---

### 7️⃣ **Branch and Bound (Optional)**

**Không bắt buộc, OR-Tools có thể dùng nếu:**
- Time limit đủ dài
- Bài toán nhỏ (<30 điểm)
- Cần nghiệm tối ưu chứng minh được

**Cách hoạt động:**
```
         [All solutions]
              |
        /-----|-----\
       /      |      \
   Xe1=[1]  Xe1=[2]  Xe1=[3]
     |        |        |
  Bound    Bound    Bound
   120km    150km    110km ← Tốt nhất, tiếp tục
     |
  Cut branches > 110km
```

**Không hiện rõ trong code** vì OR-Tools tự quyết định dùng hay không.

---

## 📊 BẢNG TỔNG HỢP CÁC THUẬT TOÁN

| STT | Thuật toán | Loại | Vị trí trong code | Khi nào dùng |
|-----|-----------|------|-------------------|--------------|
| 1 | PATH_CHEAPEST_ARC | Greedy | Dòng 178 | Nhanh, demo |
| 2 | PARALLEL_CHEAPEST_INSERTION | Insertion Heuristic | Dòng 180 | Cân bằng tải |
| 3 | LOCAL_CHEAPEST_INSERTION | Sequential Insertion | Dòng 181 | Dữ liệu có cluster |
| 4 | GLOBAL_CHEAPEST_ARC | Global Greedy | Dòng 182 | Nghiệm tốt nhất |
| 5 | Local Search (2-opt, Relocate, Exchange) | Metaheuristic | Tự động trong `SolveWithParameters()` | Luôn dùng |
| 6 | Constraint Propagation | Constraint Programming | Dòng 96 | Luôn dùng |
| 7 | Branch and Bound | Exact Algorithm | Optional, tự động | Bài nhỏ, cần optimal |

---

## 🎯 QUY TRÌNH HOÀN CHỈNH

```
┌─────────────────────────────────────┐
│  1. FIRST SOLUTION STRATEGY         │
│  (Heuristic: PATH/PARALLEL/...)     │
│  → Tìm nghiệm khả thi ban đầu       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. CONSTRAINT PROPAGATION          │
│  → Loại bỏ nghiệm vi phạm capacity  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. LOCAL SEARCH                    │
│  (2-opt, Relocate, Exchange, ...)   │
│  → Cải thiện nghiệm                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. BRANCH AND BOUND (optional)     │
│  → Tìm nghiệm tối ưu hơn            │
└──────────────┬──────────────────────┘
               │
               ▼
      [Return Best Solution]
```

---

## 💡 VÍ DỤ THỰC TẾ: OR-TOOLS CHẠY NHƯ THẾ NÀO

### Input:
```
5 điểm [1,2,3,4,5]
2 xe, capacity=100
Demand: [0, 30, 40, 50, 20, 30]
Strategy: PARALLEL_CHEAPEST_INSERTION
```

### Bước 1: First Solution (PARALLEL_CHEAPEST_INSERTION)
```
Iteration 1: Chèn điểm 1 (demand=30)
  Xe 1: [0, 1, 0] cost=20
  Xe 2: [0, 1, 0] cost=25
  → Chọn Xe 1

Iteration 2: Chèn điểm 2 (demand=40)
  Xe 1: [0, 1, 2, 0] cost=+18
  Xe 2: [0, 2, 0] cost=+22
  → Chọn Xe 1, load=70

Iteration 3: Chèn điểm 3 (demand=50)
  Xe 1: [0, 1, 2, 3, 0] → load=120 > 100 ❌ VI PHẠM
  Xe 2: [0, 3, 0] cost=+30
  → Chọn Xe 2

...

Nghiệm ban đầu:
  Xe 1: [0, 1, 2, 4, 0] load=90
  Xe 2: [0, 3, 5, 0] load=80
  Total: 120km
```

### Bước 2: Constraint Propagation
```
Kiểm tra:
  Xe 1 load=90 ≤ 100 ✓
  Xe 2 load=80 ≤ 100 ✓
  Tất cả điểm đã ghé ✓
→ Nghiệm hợp lệ
```

### Bước 3: Local Search (2-opt)
```
Thử swap:
  [0, 1, 2, 4, 0] → [0, 1, 4, 2, 0]
  Distance: 120km → 115km ✓ Tốt hơn!

Thử Relocate:
  Di chuyển điểm 4 từ Xe 1 sang Xe 2
  Xe 1: [0, 1, 2, 0] load=70
  Xe 2: [0, 3, 4, 5, 0] load=100
  Distance: 115km → 110km ✓ Tốt hơn!

Thử Exchange:
  Đổi điểm 2 và 3
  Xe 1: [0, 1, 3, 0]
  Xe 2: [0, 2, 4, 5, 0]
  Distance: 110km → 125km ✗ Tệ hơn, bỏ

Không còn cải thiện → Dừng
```

### Kết quả cuối:
```
Xe 1: [0, 1, 2, 0]
Xe 2: [0, 3, 4, 5, 0]
Total: 110km
```

---

## 🔍 DEBUGGING: XEM OR-TOOLS ĐANG DÙNG THUẬT TOÁN NÀO

### Thêm logging vào code:

```python
# Thêm vào solve_cvrp_with_config()

search_params = pywrapcp.DefaultRoutingSearchParameters()
search_params.first_solution_strategy = strategy
search_params.time_limit.seconds = time_limit_s

# ↓↓↓ THÊM LOGGING ↓↓↓
print(f"🔧 Đang dùng strategy: {strategy}")
print(f"⏱️  Time limit: {time_limit_s}s")

# Bật log chi tiết (optional)
search_params.log_search = True  # ← Thêm dòng này để xem log đầy đủ

solution = routing.SolveWithParameters(search_params)
```

### Output sẽ có dạng:
```
🔧 Đang dùng strategy: 4 (PATH_CHEAPEST_ARC)
⏱️  Time limit: 60s

OR-Tools internal log:
  Starting FIRST_SOLUTION with PATH_CHEAPEST_ARC
  Found initial solution: 5 routes, 156km
  Starting LOCAL_SEARCH
    Iteration 1: 2-opt improved to 148km
    Iteration 2: Relocate improved to 145km
    Iteration 3: No improvement
  LOCAL_SEARCH finished
  
✅ Solution found: 145km
```

---

## 🎓 KẾT LUẬN

### OR-Tools KHÔNG dùng 1 thuật toán mà dùng HYBRID:

1. **First Solution:** PATH_CHEAPEST_ARC / PARALLEL_CHEAPEST_INSERTION / LOCAL_CHEAPEST_INSERTION / GLOBAL_CHEAPEST_ARC
   - ✅ Vị trí: Dòng 98, 171-183
   
2. **Constraint Propagation:** Loại bỏ nghiệm vi phạm
   - ✅ Vị trí: Dòng 96
   
3. **Local Search:** 2-opt, Relocate, Exchange, Cross
   - ✅ Tự động trong `SolveWithParameters()`
   
4. **Branch and Bound:** (Optional)
   - ✅ OR-Tools tự quyết định

### Phân loại theo lý thuyết thuật toán:
- **Greedy:** PATH_CHEAPEST_ARC, GLOBAL_CHEAPEST_ARC
- **Heuristic:** PARALLEL/LOCAL_CHEAPEST_INSERTION
- **Metaheuristic:** Local Search (2-opt, ...)
- **Exact (optional):** Branch and Bound
- **Constraint Programming:** Constraint Propagation

---

**📝 Tóm lại:** Code của bạn dùng **4 thuật toán heuristic khác nhau** (PATH, PARALLEL, LOCAL, GLOBAL) kết hợp với **Local Search tự động** để tìm nghiệm gần tối ưu cho bài toán CVRP.
