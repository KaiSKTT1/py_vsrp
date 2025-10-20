//UploadForm
import React, { useState } from "react";

export default function UploadForm({ onResult }) {
  const [file, setFile] = useState(null);
  const [vehicles, setVehicles] = useState(5);
  const [capacity, setCapacity] = useState(100);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Chọn file .csv hoặc .vrp trước");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("vehicle_count", vehicles);
    formData.append("vehicle_capacity", capacity);

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
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="file"
        accept=".csv,.vrp"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <input
        type="number"
        value={vehicles}
        onChange={(e) => setVehicles(e.target.value)}
        placeholder="Số xe"
      />
      <input
        type="number"
        value={capacity}
        onChange={(e) => setCapacity(e.target.value)}
        placeholder="Sức chứa"
      />
      <button type="submit" className="bg-blue-500 text-white px-2">
        Solve CVRP
      </button>
    </form>
  );
}
