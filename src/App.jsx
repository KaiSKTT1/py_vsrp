import React, { useState, useEffect } from "react";
import UploadForm from "./components/UploadForm";
import UploadRealMap from "./components/UploadRealMap";
import MapView from "./components/map/MapView.jsx";
import RealMapView from "./components/map/RealMapView.jsx";

function App() {
  const [data, setData] = useState(null);
  const [showRealMap, setShowRealMap] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Hàm tính tổng khoảng cách cho một route
  const calculateRouteDistance = (route, distanceMatrix) => {
    if (!route || !distanceMatrix) return 0;
    try {
      return route.reduce((total, point, idx) => {
        if (idx === 0) return 0;
        const prevPoint = route[idx - 1];
        if (
          distanceMatrix[prevPoint] &&
          typeof distanceMatrix[prevPoint][point] === "number"
        ) {
          return total + distanceMatrix[prevPoint][point];
        }
        return total;
      }, 0);
    } catch (error) {
      console.error("Lỗi khi tính khoảng cách:", error);
      return 0;
    }
  };

  // Reset xe được chọn khi upload dữ liệu mới
  useEffect(() => {
    setSelectedVehicle(null);
  }, [data]);

  const handleSelectVehicle = (index) => {
    setSelectedVehicle((prev) => (prev === index ? null : index)); // toggle chọn/bỏ chọn
  };

  const handleShowAll = () => {
    setSelectedVehicle("all"); // Sử dụng giá trị đặc biệt "all"
  };

  const getColorForVehicle = (i, total) =>
    `hsl(${(i * 360) / (total || 1)}, 80%, 50%)`;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">CVRP Web</h1>

      {/* Nút chọn loại bản đồ */}
      <div className="flex gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded ${
            !showRealMap ? "bg-blue-600 text-white" : "bg-gray-300"
          }`}
          onClick={() => {
            setShowRealMap(false);
            setSelectedVehicle(null);
          }}
        >
          Bản đồ CVRP (tọa độ phẳng)
        </button>
        <button
          className={`px-4 py-2 rounded ${
            showRealMap ? "bg-blue-600 text-white" : "bg-gray-300"
          }`}
          onClick={() => {
            setShowRealMap(true);
            setSelectedVehicle(null);
          }}
        >
          Bản đồ Việt Nam (thực tế)
        </button>
      </div>

      {/* Upload */}
      {!showRealMap && <UploadForm onResult={setData} />}
      {showRealMap && <UploadRealMap onResult={setData} />}

      {/* Kết quả & bản đồ */}
      <div className="mt-4">
        {data ? (
          <>
            {/* Bảng thông tin */}
            <div className="bg-gray-100 p-3 rounded mb-4 shadow">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-bold">Kết quả tối ưu hóa</h2>
                <button
                  onClick={handleShowAll}
                  className={`px-3 py-1 rounded text-sm ${
                    selectedVehicle === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {selectedVehicle === "all"
                    ? "Đang hiển thị tất cả"
                    : "Hiển thị tất cả"}
                </button>
              </div>
              <p>
                Tổng nhu cầu: <b>{data.total_demand}</b>
              </p>
              <p>
                Số xe: <b>{data.vehicle_count}</b>
              </p>
              <p>
                Tổng tuyến đường: <b>{data.routes?.length || 0}</b>
              </p>

              {data.routes?.map((route, i) => {
                const color = getColorForVehicle(i, data.routes.length);
                const isSelected = selectedVehicle === i;

                return (
                  <div
                    key={i}
                    onClick={() => handleSelectVehicle(i)}
                    className={`flex items-center gap-2 mt-1 cursor-pointer transition ${
                      isSelected ? "bg-blue-100" : "hover:bg-gray-100"
                    } p-1 rounded`}
                  >
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        backgroundColor: color,
                        border: "1px solid #333",
                      }}
                    ></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span>
                          🚚 <b>Xe {i + 1}</b>: {route.join(" → ")}
                        </span>
                        {isSelected && (
                          <span className="text-sm text-blue-600">
                            (đang hiển thị)
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <div>
                          Tải trọng:{" "}
                          <b>
                            {route.reduce(
                              (sum, point) => sum + (data.demands[point] || 0),
                              0
                            )}
                          </b>
                          /{data.vehicle_capacity} đơn vị
                          <div className="w-full bg-gray-200 rounded h-2 mt-1">
                            <div
                              className={`h-full rounded ${
                                route.reduce(
                                  (sum, point) =>
                                    sum + (data.demands[point] || 0),
                                  0
                                ) > data.vehicle_capacity
                                  ? "bg-red-500"
                                  : "bg-green-500"
                              }`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  (route.reduce(
                                    (sum, point) =>
                                      sum + (data.demands[point] || 0),
                                    0
                                  ) /
                                    data.vehicle_capacity) *
                                    100
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="mt-1">
                          {/* Hiển thị khoảng cách */}
                          {data.distance_matrix && (
                            <>
                              Quãng đường:{" "}
                              <b>
                                {calculateRouteDistance(
                                  route,
                                  data.distance_matrix
                                ).toLocaleString()}{" "}
                                mét
                              </b>{" "}
                              (
                              {(
                                calculateRouteDistance(
                                  route,
                                  data.distance_matrix
                                ) / 1000
                              ).toFixed(2)}{" "}
                              km)
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bản đồ */}
            {!showRealMap ? (
              <MapView
                routes={data.routes}
                locations={data.locations}
                selectedVehicle={
                  selectedVehicle === "all" ? null : selectedVehicle
                }
                showAllRoutes={selectedVehicle === "all"}
              />
            ) : (
              <RealMapView
                routes={data.routes}
                locations={data.locations}
                selectedVehicle={
                  selectedVehicle === "all" ? null : selectedVehicle
                }
                showAllRoutes={selectedVehicle === "all"}
              />
            )}
          </>
        ) : (
          <div className="text-gray-500">Chưa có dữ liệu.</div>
        )}
      </div>
    </div>
  );
}

export default App;
