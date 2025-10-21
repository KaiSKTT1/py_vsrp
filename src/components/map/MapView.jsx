import { MapContainer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import L from "leaflet";

//  Hàm sinh màu động dựa trên số lượng xe
function generateColors(n) {
  const colors = [];
  const hueStep = 360 / Math.max(n, 1);
  for (let i = 0; i < n; i++) {
    const hue = i * hueStep;
    colors.push(`hsl(${hue}, 80%, 50%)`);
  }
  return colors;
}

// Component tự động fit bounds khi locations thay đổi
function FitBoundsComponent({ locations }) {
  const map = useMap();

  useEffect(() => {
    if (!locations || locations.length === 0) return;

    try {
      // Tính bounding box cho CVRP coordinates (x, y)
      const xs = locations.map((loc) => loc[0]);
      const ys = locations.map((loc) => loc[1]);
      const bounds = [
        [Math.min(...ys) - 10, Math.min(...xs) - 10],
        [Math.max(...ys) + 10, Math.max(...xs) + 10],
      ];
      
      // Fit map vào bounds
      map.fitBounds(bounds, {
        padding: [50, 50],
        animate: true,
        duration: 0.5
      });
    } catch (error) {
      console.error("Lỗi khi fit bounds:", error);
    }
  }, [locations, map]);

  return null;
}

const MapView = ({ locations = [], routes = [], selectedVehicle = null }) => {
  if (!locations.length) {
    return <div className="text-gray-500 p-4">Chưa có dữ liệu định tuyến</div>;
  }

  // Tính bounding box để fit bản đồ
  const xs = locations.map((loc) => loc[0]);
  const ys = locations.map((loc) => loc[1]);
  const bounds = [
    [Math.min(...ys) - 10, Math.min(...xs) - 10],
    [Math.max(...ys) + 10, Math.max(...xs) + 10],
  ];

  //  Tạo bảng màu động
  const COLORS = generateColors(routes.length);

  // Lọc route hiển thị — nếu có selectedVehicle thì chỉ hiển thị route đó
  const visibleRoutes =
    selectedVehicle !== null ? [routes[selectedVehicle]] : routes;

  return (
    <MapContainer
      crs={L.CRS.Simple}
      bounds={bounds}
      style={{ height: "500px", width: "100%", borderRadius: "12px" }}
    >
      {/* Tự động fit bounds khi locations thay đổi */}
      <FitBoundsComponent locations={locations} />
      
      {/* Vẽ các tuyến đường */}
      {visibleRoutes.map((route, idx) => {
        const latlngs = route.map((i) => {
          const [x, y] = locations[i];
          return [y, x]; // Leaflet dùng [lat, lng]
        });

        // Nếu đang chọn xe, dùng màu xe thật; nếu không, theo index
        const color =
          selectedVehicle !== null
            ? COLORS[selectedVehicle % COLORS.length]
            : COLORS[idx % COLORS.length];

        // Làm xe đang chọn đậm hơn
        const weight =
          selectedVehicle !== null
            ? 5
            : 3;

        return (
          <Polyline
            key={idx}
            positions={latlngs}
            pathOptions={{
              color,
              weight,
              opacity: 0.9,
            }}
          />
        );
      })}

      {/* Vẽ các điểm (Depot + Khách hàng) */}
      {locations.map(([x, y], idx) => {
        // Tìm màu viền của node tương ứng tuyến xe
        let borderColor = "black";
        for (let r = 0; r < routes.length; r++) {
          if (routes[r].includes(idx)) {
            borderColor = COLORS[r % COLORS.length];
            break;
          }
        }

        // Nếu chọn xe → chỉ đánh sáng các node thuộc xe đó
        const isHidden =
          selectedVehicle !== null &&
          !routes[selectedVehicle].includes(idx) &&
          idx !== 0;

        if (isHidden) return null;

        const bgColor = idx === 0 ? "black" : "white";
        const textColor = idx === 0 ? "white" : "black";

        const customIcon = L.divIcon({
          className: "custom-marker",
          html: `
            <div style="
              display:flex;
              align-items:center;
              justify-content:center;
              width:22px;
              height:22px;
              border-radius:50%;
              border:3px solid ${borderColor};
              background-color:${bgColor};
              color:${textColor};
              font-size:11px;
              font-weight:bold;
              text-align:center;
              box-shadow:0 0 3px rgba(0,0,0,0.4);
            ">
              ${idx === 0 ? "D" : idx}
            </div>
          `,
        });

        return (
          <Marker key={idx} position={[y, x]} icon={customIcon}>
            <Popup>
              <b>{idx === 0 ? "Depot" : `Khách hàng ${idx}`}</b>
              <br />
              x: {x}, y: {y}
              <br />
              Màu xe:{" "}
              <span style={{ color: borderColor, fontWeight: "bold" }}>
                {borderColor}
              </span>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default MapView;
