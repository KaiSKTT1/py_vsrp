// src/components/UploadRealMap.jsx
import React, { useState } from "react";
import Papa from "papaparse";

export default function UploadRealMap({ onResult }) {
  const [file, setFile] = useState(null);
  const [vehicleCapacity, setVehicleCapacity] = useState(100);
  const [loading, setLoading] = useState(false);
  const [previewInfo, setPreviewInfo] = useState(null);

  const handleChange = (e) => {
    setFile(e.target.files[0]);
    setPreviewInfo(null);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Vui lòng chọn file CSV trước!");
      return;
    }

    // Đọc CSV để tính tổng demand
    const csvText = await file.text();
    const parsed = Papa.parse(csvText, { header: true });
    const rows = parsed.data.filter(r => r.lat && r.lng);
    const demands = rows.map(r => parseFloat(r.demand || 0));
    const totalDemand = demands.reduce((a, b) => a + b, 0);

    // Tự tính số xe cần thiết
    const vehicleCount = Math.ceil(totalDemand / vehicleCapacity);

    // Hiển thị cho người dùng xem trước
    setPreviewInfo({ totalDemand, vehicleCount });

    // Gửi đến backend
    const formData = new FormData();
    formData.append("file", file);
    formData.append("vehicle_count", vehicleCount);
    formData.append("vehicle_capacity", vehicleCapacity);

    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/solve_cvrp", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Lỗi khi xử lý CSV");
      const data = await res.json();

      // Gửi dữ liệu kết quả ra App
      onResult(data);
    } catch (err) {
      alert("Không thể xử lý file: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="px-4 py-2 bg-gray-100 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition">
            <span className="text-gray-700">
              {file ? file.name : "Chọn tệp"}
            </span>
            <input
              type="file"
              accept=".csv"
              onChange={handleChange}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-gray-700 font-medium">Tải trọng mỗi xe:</label>
          <input
            type="number"
            value={vehicleCapacity}
            min={1}
            onChange={(e) => setVehicleCapacity(e.target.value)}
            className="w-24 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={loading}
          className={`px-6 py-2 rounded-lg font-medium text-white transition-all shadow-md ${loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
            }`}
        >
          {loading ? "Đang giải..." : "Giải CVRP & Hiển thị"}
        </button>
      </div>

      {previewInfo && (
        <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-lg">
          <div className="flex gap-6 text-sm">
            <p className="text-gray-700">
              Tổng nhu cầu: <b className="text-indigo-600">{previewInfo.totalDemand}</b>
            </p>
            <p className="text-gray-700">
              Tải trọng mỗi xe: <b className="text-indigo-600">{vehicleCapacity}</b>
            </p>
            <p className="text-gray-700">
              Số xe ước tính: <b className="text-indigo-600">{previewInfo.vehicleCount}</b>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

