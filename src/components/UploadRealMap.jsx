// src/components/UploadRealMap.jsx
import React, { useState } from "react";
import Papa from "papaparse";

export default function UploadRealMap({ onResult }) {
  const [file, setFile] = useState(null);
  const [vehicleCapacity, setVehicleCapacity] = useState(100);
  const [loading, setLoading] = useState(false);
  const [previewInfo, setPreviewInfo] = useState(null);

  const handleChange = (e) => setFile(e.target.files[0]);

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
    <div className="flex flex-col gap-3 mt-4">
      <div className="flex items-center gap-3">
        <input type="file" accept=".csv" onChange={handleChange} />
        <input
          type="number"
          value={vehicleCapacity}
          min={1}
          onChange={(e) => setVehicleCapacity(e.target.value)}
          className="border px-2 py-1 w-24 rounded"
          placeholder="Tải trọng xe"
        />
        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-green-600 text-white px-3 py-1 rounded"
        >
          {loading ? "Đang xử lý..." : "Giải CVRP & Hiển thị"}
        </button>
      </div>

      {previewInfo && (
        <div className="bg-gray-100 p-2 rounded shadow-sm text-sm">
          <p>Tổng nhu cầu: <b>{previewInfo.totalDemand}</b></p>
          <p>Tải trọng mỗi xe: <b>{vehicleCapacity}</b></p>
          <p>Số xe ước tính: <b>{previewInfo.vehicleCount}</b></p>
        </div>
      )}
    </div>
  );
}
