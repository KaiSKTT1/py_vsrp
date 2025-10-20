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

// Component con để xử lý routing
function RoutingMachineLayer({ routes, locations, selectedVehicle, COLORS }) {
  const map = useMap();
  const routingControlsRef = useRef([]);

  useEffect(() => {
    if (!routes.length || !locations.length) return;

    // Xóa các routing controls cũ
    routingControlsRef.current.forEach(control => {
      if (map) control.remove();
    });
    routingControlsRef.current = [];

    // Tạo routing controls mới
    routes.forEach((route, routeIndex) => {
      if (selectedVehicle !== null && selectedVehicle !== routeIndex) return;

      const waypoints = route.map(nodeIdx => {
        const [lat, lng] = locations[nodeIdx];
        return L.latLng(lat, lng);
      });

      // Danh sách các OSRM servers để luân phiên
      const osrmServers = [
        'https://router.project-osrm.org/route/v1',
        'https://routing.openstreetmap.de/routed-car/route/v1',
        'https://routing.osrm.at/route/v1'
      ];

      // Tạo router với retry logic
      const createRouter = (serverIndex = 0) => {
        return L.Routing.osrmv1({
          serviceUrl: osrmServers[serverIndex % osrmServers.length],
          timeout: 30000,
          profile: 'driving',
          handleError: function(error) {
            // Nếu lỗi 429 hoặc connection reset, thử server khác
            if (error.status === 429 || error.type === 'TypeError') {
              return createRouter(serverIndex + 1);
            }
            return error;
          }
        });
      };

      const routingControl = L.Routing.control({
        waypoints,
        router: createRouter(routeIndex), // Sử dụng route index để phân tán requests
        show: false,
        addWaypoints: false,
        routeWhileDragging: false,
        fitSelectedRoutes: false,
        lineOptions: {
          styles: [
            { color: COLORS[routeIndex % COLORS.length], weight: 4, opacity: 0.9 }
          ]
        },
        createMarker: () => null,
        routeWhileDragging: false,
        showAlternatives: false,
        useZoomParameter: false,

        // Event handlers
        routesFailed: function (e) {
          console.log('All routing attempts failed, falling back to straight line');
          try {
            const polyline = L.polyline(waypoints, {
              color: COLORS[routeIndex % COLORS.length],
              weight: 4,
              opacity: 0.9,
              dashArray: '10, 10'
            });
            polyline.addTo(map);
            
            // Store the fallback polyline for cleanup
            if (!routingControlsRef.current[routeIndex]) {
              routingControlsRef.current[routeIndex] = {
                remove: () => map.removeLayer(polyline)
              };
            }
          } catch (err) {
            console.error('Error creating fallback route:', err);
          }
        }
      });

      routingControl.addTo(map);
      routingControlsRef.current.push(routingControl);
    });

    // Cleanup
    return () => {
      routingControlsRef.current.forEach(control => {
        if (map) control.remove();
      });
      routingControlsRef.current = [];
    };
  }, [map, routes, locations, selectedVehicle, COLORS]);

  return null;
}

export default function RealMapView({ routes = [], locations = [], selectedVehicle = null }) {
  const COLORS = generateColors(routes.length || 1);

  if (!locations.length) return <p>❗ Chưa có dữ liệu để hiển thị bản đồ.</p>;

  const center = [locations[0][0], locations[0][1]];

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
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: "500px", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
      />
      <RoutingMachineLayer
        routes={routes}
        locations={locations}
        selectedVehicle={selectedVehicle}
        COLORS={COLORS}
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
              <b>{idx === 0 ? "Depot" : `Node ${idx}`}</b><br />
              Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}<br />
              Màu xe: <span style={{ color: borderColor }}>{borderColor}</span>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
