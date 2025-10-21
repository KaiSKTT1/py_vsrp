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
    setSelectedVehicle((prev) => (prev === index ? null : index));
  };

  const handleShowAll = () => {
    setSelectedVehicle("all");
  };

  const getColorForVehicle = (i, total) =>
    `hsl(${(i * 360) / (total || 1)}, 80%, 50%)`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-5xl font-bold text-indigo-600 mb-2">
          CVRP Web Solution
        </h1>
        <p className="text-gray-600 text-lg">Tối ưu hóa tuyến đường vận chuyển</p>
      </div>

      {/* Map Toggle Buttons */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => {
            setShowRealMap(false);
            setSelectedVehicle(null);
          }}
          className={`px-6 py-3 rounded-lg font-medium transition-all shadow-md ${
            !showRealMap
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          🗺️ Bản đồ CVRP (tọa độ phẳng)
        </button>
        <button
          onClick={() => {
            setShowRealMap(true);
            setSelectedVehicle(null);
          }}
          className={`px-6 py-3 rounded-lg font-medium transition-all shadow-md ${
            showRealMap
              ? "bg-green-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          🌍 Bản đồ Việt Nam (thực tế)
        </button>
      </div>

      {/* Upload Form Section */}
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          {!showRealMap ? (
            <UploadForm onResult={setData} setData={setData} />
          ) : (
            <UploadRealMap onResult={setData} setData={setData} />
          )}
        </div>
      </div>

      {/* Main Content */}
      {data ? (
        <div className="max-w-7xl mx-auto px-4 pb-8">
          <div className="flex gap-6">
            {/* Left Sidebar - Results */}
            <div className="w-96 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                <div className="border-l-4 border-indigo-600 pl-4 mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    Kết quả tối ưu hóa
                  </h2>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-indigo-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Tổng nhu cầu</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {data.total_demand}
                    </p>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Số xe</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {data.vehicle_count}
                    </p>
                  </div>
                </div>

                <div className="bg-indigo-50 rounded-lg p-4 text-center mb-6">
                  <p className="text-sm text-gray-600 mb-1">Tổng tuyến đường</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {data.routes?.length || 0}
                  </p>
                </div>

                {/* Route List */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-700">
                      Danh sách tuyến đường:
                    </h3>
                    <button
                      onClick={handleShowAll}
                      className="text-xs px-3 py-1 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition"
                    >
                      {selectedVehicle === "all"
                        ? "Đang hiển thị tất cả"
                        : "Hiển thị tất cả"}
                    </button>
                  </div>

                  <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {data.routes?.map((route, i) => {
                      const color = getColorForVehicle(i, data.routes.length);
                      const isSelected = selectedVehicle === i;
                      const loadAmount = route.reduce(
                        (sum, point) => sum + (data.demands[point] || 0),
                        0
                      );
                      const loadPercent =
                        (loadAmount / data.vehicle_capacity) * 100;

                      return (
                        <div
                          key={i}
                          onClick={() => handleSelectVehicle(i)}
                          className={`cursor-pointer transition-all rounded-lg border-2 p-4 ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-50 shadow-md"
                              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow"
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: "50%",
                                backgroundColor: color,
                                border: "2px solid #333",
                                flexShrink: 0,
                              }}
                            ></div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-800">
                                Xe {i + 1}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {route.join(" → ")}
                              </div>
                            </div>
                          </div>

                          {/* Load Bar */}
                          <div className="mb-2">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>Tải trọng:</span>
                              <span>
                                <b>{loadAmount}</b>/{data.vehicle_capacity}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  loadAmount > data.vehicle_capacity
                                    ? "bg-red-500"
                                    : "bg-green-500"
                                }`}
                                style={{
                                  width: `${Math.min(100, loadPercent)}%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          {/* Distance */}
                          {data.distance_matrix && (
                            <div className="text-xs text-gray-600">
                              Quãng đường:{" "}
                              <b className="text-gray-800">
                                {(
                                  calculateRouteDistance(
                                    route,
                                    data.distance_matrix
                                  ) / 1000
                                ).toFixed(2)}{" "}
                                km
                              </b>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Map */}
            <div className="flex-1">
              <div
                className="bg-white rounded-xl shadow-lg overflow-hidden"
                style={{ height: "700px" }}
              >
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
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <p className="text-gray-500 text-lg">
              Chưa có dữ liệu. Vui lòng upload file để bắt đầu!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
