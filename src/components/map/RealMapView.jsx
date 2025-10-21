import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet-routing-machine";

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
      // Tạo bounds từ tất cả các điểm
      const bounds = L.latLngBounds(
        locations.map(([lat, lng]) => [lat, lng])
      );

      // Fit map vào bounds với padding
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15,
        animate: true,
        duration: 0.5
      });
    } catch (error) {
      console.error("Lỗi khi fit bounds:", error);
    }
  }, [locations, map]);

  return null;
}

// Component con để xử lý routing với fix lỗi removeLayer
function RoutingMachineLayer({
  routes,
  locations,
  selectedVehicle,
  COLORS,
  onError,
}) {
  const map = useMap();
  const routingControlsRef = useRef([]);

  useEffect(() => {
    if (!routes.length || !locations.length || !map) return;

    // Xóa đường cũ một cách an toàn - FIX LỖI REMOVELAYER
    routingControlsRef.current.forEach((control) => {
      try {
        if (control && control.remove && map && !map._destroyed) {
          control.remove();
        }
      } catch (error) {
        console.warn("Lỗi khi xóa routing control:", error);
      }
    });
    routingControlsRef.current = [];

    // Vẽ đường mới
    routes.forEach((route, routeIndex) => {
      if (selectedVehicle !== null && selectedVehicle !== routeIndex) return;

      const waypoints = route.map((nodeIdx) => {
        const [lat, lng] = locations[nodeIdx];
        return L.latLng(lat, lng);
      });

      try {
        // Tạo đường đi với error handling
        const routingControl = L.Routing.control({
          waypoints,
          router: L.Routing.osrmv1({
            serviceUrl: "https://routing.openstreetmap.de/routed-car/route/v1",
            timeout: 10000,
            profile: "driving",
          }),
          show: false,
          addWaypoints: false,
          routeWhileDragging: false,
          fitSelectedRoutes: false,
          lineOptions: {
            styles: [
              {
                color: COLORS[routeIndex % COLORS.length],
                weight: 4,
                opacity: 0.9,
              },
            ],
          },
          createMarker: () => null,

          // Nếu không tìm được đường thì vẽ đường thẳng
          routesFailed: function () {
            try {
              const straightLine = L.polyline(waypoints, {
                color: COLORS[routeIndex % COLORS.length],
                weight: 4,
                opacity: 0.7,
                dashArray: "10, 10",
              }).addTo(map);

              routingControlsRef.current.push({
                remove: () => {
                  try {
                    if (
                      map &&
                      straightLine &&
                      !map._destroyed &&
                      map.hasLayer(straightLine)
                    ) {
                      map.removeLayer(straightLine);
                    }
                  } catch (error) {
                    console.warn("Lỗi khi xóa straight line:", error);
                  }
                },
              });
            } catch (error) {
              console.warn("Lỗi khi tạo straight line:", error);
            }
          },
        });

        routingControl.addTo(map);
        routingControlsRef.current.push(routingControl);
      } catch (error) {
        console.warn("Lỗi khi tạo routing control:", error);
        if (onError) {
          onError(
            `Không thể tạo route cho xe ${routeIndex + 1}: ${error.message}`
          );
        }
        // Fallback: vẽ đường thẳng nếu routing thất bại
        try {
          const straightLine = L.polyline(waypoints, {
            color: COLORS[routeIndex % COLORS.length],
            weight: 4,
            opacity: 0.7,
            dashArray: "10, 10",
          }).addTo(map);

          routingControlsRef.current.push({
            remove: () => {
              try {
                if (
                  map &&
                  straightLine &&
                  !map._destroyed &&
                  map.hasLayer(straightLine)
                ) {
                  map.removeLayer(straightLine);
                }
              } catch (error) {
                console.warn("Lỗi khi xóa fallback line:", error);
              }
            },
          });
        } catch (fallbackError) {
          console.warn("Lỗi khi tạo fallback line:", fallbackError);
          if (onError) {
            onError(
              `Không thể vẽ đường thẳng cho xe ${routeIndex + 1}: ${fallbackError.message
              }`
            );
          }
        }
      }
    });

    // Cleanup khi component unmount - FIX LỖI REMOVELAYER
    return () => {
      routingControlsRef.current.forEach((control) => {
        try {
          if (control && control.remove && map && !map._destroyed) {
            control.remove();
          }
        } catch (error) {
          console.warn("Lỗi khi cleanup routing control:", error);
        }
      });
      routingControlsRef.current = [];
    };
  }, [map, routes, locations, selectedVehicle, COLORS]);

  return null;
}

export default function RealMapView({
  routes = [],
  locations = [],
  selectedVehicle = null,
}) {
  const COLORS = generateColors(routes.length || 1);
  const [routingError, setRoutingError] = useState(null);

  if (!locations.length) return <p>❗ Chưa có dữ liệu để hiển thị bản đồ.</p>;

  const center = [locations[0][0], locations[0][1]];

  // Kiểm tra tọa độ hợp lệ
  const isValidCoordinate = (lat, lng) => {
    return (
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180 &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      isFinite(lat) &&
      isFinite(lng)
    );
  };

  // Kiểm tra tất cả tọa độ
  const hasValidCoordinates = locations.every(([lat, lng]) =>
    isValidCoordinate(lat, lng)
  );

  // --- Hàm tìm màu viền cho từng node ---
  const getNodeColor = (nodeIdx) => {
    if (nodeIdx === 0) return "black"; // Depot
    for (let r = 0; r < routes.length; r++) {
      if (routes[r].includes(nodeIdx)) {
        return COLORS[r % COLORS.length];
      }
    }
    return "#555";
  };

  // --- Hàm kiểm tra node có thuộc tuyến đang chọn không ---
  const isNodeVisible = (nodeIdx) => {
    if (selectedVehicle === null) return true;
    if (nodeIdx === 0) return true; // depot luôn hiển thị
    return routes[selectedVehicle]?.includes(nodeIdx);
  };

  return (
    <div>
      {!hasValidCoordinates && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          ⚠️ Cảnh báo: Một số tọa độ không hợp lệ. Routing có thể không hoạt
          động chính xác.
        </div>
      )}

      {routingError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          ❌ Lỗi routing: {routingError}
        </div>
      )}

      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "500px", width: "100%", borderRadius: "12px" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        />

        {/* Tự động fit bounds khi locations thay đổi */}
        <FitBoundsComponent locations={locations} />

        <RoutingMachineLayer
          routes={routes}
          locations={locations}
          selectedVehicle={selectedVehicle}
          COLORS={COLORS}
          onError={setRoutingError}
        />

        {/* Vẽ các node với số thứ tự và màu viền tương ứng xe */}
        {locations.map(([lat, lng], idx) => {
          if (!isNodeVisible(idx)) return null;

          const borderColor = getNodeColor(idx);
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
            <Marker key={idx} position={[lat, lng]} icon={customIcon}>
              <Popup>
                <b>{idx === 0 ? "Depot" : `Node ${idx}`}</b>
                <br />
                Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}
                <br />
                Màu xe:{" "}
                <span style={{ color: borderColor }}>{borderColor}</span>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
