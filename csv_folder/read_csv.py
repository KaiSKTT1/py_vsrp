import pandas as pd
import random

# Đọc file CSV gốc từ Overpass
df = pd.read_csv("osm_raw.csv")

# Gán id chạy từ 100
df["id"] = range(100, 100 + len(df))

# Sinh ngẫu nhiên demand từ 1 đến 50
df["demand"] = [random.randint(1, 50) for _ in range(len(df))]

# Sắp xếp lại cột cho đúng thứ tự
df = df[["id", "@lat", "@lon", "demand"]]
df.columns = ["id", "lat", "lng", "demand"]

# Lưu lại file hoàn chỉnh
df.to_csv("hcmc_points_300.csv", index=False)
print("✅ File đã lưu: hcmc_points_300.csv")
