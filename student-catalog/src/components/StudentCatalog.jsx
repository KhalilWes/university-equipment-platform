import React, { useState } from "react";

const equipmentData = [
  { id: 1, name: "Projector", status: "Available", quantity: 4 },
  { id: 2, name: "Laptop", status: "Out of Stock", quantity: 0 },
  { id: 3, name: "Camera", status: "Available", quantity: 3 },
  { id: 4, name: "Microphone", status: "Out of Stock", quantity: 0 },
  { id: 5, name: "Tablet", status: "Available", quantity: 6 },
  { id: 6, name: "3D Printer", status: "Available", quantity: 2 },
  { id: 7, name: "VR Headset", status: "Out of Stock", quantity: 0 },
  { id: 8, name: "Wireless Speaker", status: "Available", quantity: 5 },
  { id: 9, name: "Graphics Tablet", status: "Available", quantity: 4 },
  { id: 10, name: "Document Scanner", status: "Out of Stock", quantity: 0 },
];

function StudentCatalog() {
  const [search, setSearch] = useState("");

  const filteredData = equipmentData.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="catalog-page">
      <section className="catalog-header">
        <div>
          <p className="catalog-tag">University Equipment</p>
          <h1>Réserve ton matériel facilement</h1>
          <p className="catalog-description">
            Parcours les équipements disponibles et clique sur « Réserver » pour
            bloquer ton matériel.
          </p>
        </div>
      </section>

      <section className="catalog-search">
        <input
          type="text"
          placeholder="Rechercher un équipement..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </section>

      <section className="equipment-grid">
        {filteredData.map((item) => (
          <article key={item.id} className="equipment-card">
            <div className="equipment-card-top">
              <span className="equipment-icon">📦</span>
              <span
                className={`status-badge ${
                  item.status === "Available" ? "status-available" : "status-unavailable"
                }`}
              >
                {item.status}
              </span>
            </div>
            <h2>{item.name}</h2>
            <p className="equipment-quantity">Quantité existante : <strong>{item.quantity}</strong></p>
            <p className="equipment-note">
              Un matériel fiable et prêt à l'usage pour tes projets universitaires.
            </p>
            <button type="button" disabled={item.status !== "Available"} className="reserve-button">
              Réserver
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}

export default StudentCatalog;
