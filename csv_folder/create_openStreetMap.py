import requests
import pandas as pd
import time
import random

def get_real_locations_by_district(start_id=300):
    """Lấy địa điểm thật theo từng quận ở TP.HCM"""
    
    # Các khu vực trung tâm TP.HCM với bounding box
    districts = [
        {"name": "Quận 1", "bbox": [10.76, 106.68, 10.79, 106.71]},
        {"name": "Quận 3", "bbox": [10.76, 106.66, 10.79, 106.69]},
        {"name": "Quận 4", "bbox": [10.75, 106.69, 10.77, 106.71]},
        {"name": "Quận 5", "bbox": [10.75, 106.66, 10.77, 106.69]},
        {"name": "Quận 10", "bbox": [10.76, 106.64, 10.79, 106.67]},
        {"name": "Quận Phú Nhuận", "bbox": [10.79, 106.67, 10.81, 106.69]},
        {"name": "Quận Bình Thạnh", "bbox": [10.79, 106.69, 10.81, 106.73]},
        {"name": "Quận Tân Bình", "bbox": [10.79, 106.64, 10.82, 106.67]},
        {"name": "Quận Gò Vấp", "bbox": [10.83, 106.64, 10.86, 106.69]},
    ]
    
    all_locations = []
    current_id = start_id
    
    # Điểm depot (demand = 0)
    all_locations.append({
        "id": start_id - 1,
        "lat": 10.7626,
        "lng": 106.6602,
        "demand": 0,
        "name": "depot"
    })
    
    for district in districts:
        if len(all_locations) >= 701:  # Đã đủ 700 + depot
            break
            
        print(f"🔄 Đang lấy dữ liệu {district['name']}...")
        
        bbox = district['bbox']
        overpass_query = f"""
        [out:json][timeout:60];
        (
          node["shop"]({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
          node["amenity"]({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
          node["office"]({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
          node["building"]({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
        );
        out body;
        """
        
        try:
            response = requests.post("http://overpass-api.de/api/interpreter", 
                                   data=overpass_query)
            data = response.json()
            
            for element in data['elements']:
                if len(all_locations) >= 701:
                    break
                    
                name = element.get('tags', {}).get('name', '')
                all_locations.append({
                    "id": current_id,
                    "lat": round(element['lat'], 6),
                    "lng": round(element['lon'], 6),
                    "demand": random.randint(1, 40),  # ĐÃ SỬA: demand ngẫu nhiên 1-40
                    "name": name,
                    "district": district['name'],
                    "osm_id": element['id']
                })
                current_id += 1
                
            time.sleep(1)  # Tránh overload server
            
        except Exception as e:
            print(f"❌ Lỗi ở {district['name']}: {e}")
            continue
    
    return all_locations

# Chạy chương trình
print("🚀 Bắt đầu lấy 700 điểm THẬT theo quận...")
locations = get_real_locations_by_district(start_id=300)

if locations and len(locations) >= 701:
    df = pd.DataFrame(locations)
    df[['id', 'lat', 'lng', 'demand']].to_csv("hcm_700_real_by_district.csv", index=False)
    
    print(f"\n✅ HOÀN THÀNH!")
    print(f"📊 Đã lấy được {len(df)} điểm thực tế")
    print(f"📍 Dữ liệu 100% từ OpenStreetMap")
    print(f"🎯 Demand ngẫu nhiên từ 1-40")
    print(f"📋 10 điểm đầu:")
    print(df[['id', 'lat', 'lng', 'demand']].head(10))
    
    # Thống kê demand
    print(f"\n📈 Thống kê demand:")
    print(f"   Min: {df['demand'].min()}")
    print(f"   Max: {df['demand'].max()}")
    print(f"   Avg: {df['demand'].mean():.1f}")
    
else:
    print(f"❌ Chỉ lấy được {len(locations) if locations else 0} điểm")