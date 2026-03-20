import React, { useState } from "react";

const equipmentData = [
  { id: 1, name: "Projector", status: "Available" },
  { id: 2, name: "Laptop", status: "Out of Stock" },
  { id: 3, name: "Camera", status: "Available" },
  { id: 4, name: "Microphone", status: "Out of Stock" },
];

function StudentCatalog() {
  const [search, setSearch] = useState("");

  const filteredData = equipmentData.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Student Equipment Catalog</h1>

      <input
        type="text"
        placeholder="Search equipment..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 w-full p-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredData.map((item) => (
          <div
            key={item.id}
            className="border rounded p-4 shadow hover:shadow-lg transition duration-200"
          >
            <h2 className="font-semibold text-lg mb-2">{item.name}</h2>
            <span
              className={`px-2 py-1 text-sm font-medium rounded-full ${
                item.status === "Available"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudentCatalog;