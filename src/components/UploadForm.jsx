//UploadForm
import React, { useState } from "react";

export default function UploadForm({ onResult }) {
  const [file, setFile] = useState(null);
  const [vehicles, setVehicles] = useState(5);
  const [capacity, setCapacity] = useState(100);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Chọn file .csv hoặc .vrp trước");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("vehicle_count", vehicles);
    formData.append("vehicle_capacity", capacity);

    try {
      const resp = await fetch("http://localhost:8000/solve_cvrp", {
        method: "POST",
        body: formData,
      });
      const data = await resp.json();
      if (!resp.ok) {
        alert("Lỗi từ server: " + (data.detail || JSON.stringify(data)));
        return;
      }
      onResult(data);
      console.log("Server response:", data);
    } catch (error) {
      alert("Lỗi kết nối: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <label className="px-4 py-2 bg-gray-100 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition">
          <span className="text-gray-700">
            {file ? file.name : "Chọn tệp"}
          </span>
          <input
            type="file"
            accept=".csv,.vrp"
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
          />
        </label>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-gray-700 font-medium">Số xe:</label>
        <input
          type="number"
          value={vehicles}
          onChange={(e) => setVehicles(e.target.value)}
          className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
          min="1"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-gray-700 font-medium">Tải trọng:</label>
        <input
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          className="w-24 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
          min="1"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`px-6 py-2 rounded-lg font-medium text-white transition-all shadow-md ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "Đang giải..." : "Giải CVRP & Hiển thị"}
      </button>
    </form>
  );
}

