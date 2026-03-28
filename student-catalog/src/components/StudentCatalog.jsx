import React, { useState } from "react";

const today = new Date().toISOString().split("T")[0];

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
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [errorMessage, setErrorMessage] = useState("");

  const filteredData = equipmentData.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (item) => {
    if (item.status !== "Available" || item.quantity <= 0) {
      setErrorMessage("Cet équipement n'est pas disponible pour le moment.");
      return;
    }

    setSelectedEquipment(item);
    setShowModal(true);
    setStartDate(today);
    setEndDate(today);
    setErrorMessage("");
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEquipment(null);
    setErrorMessage("");
  };

  const handleConfirmReservation = () => {
    if (!selectedEquipment) return;
    if (!startDate || !endDate) {
      setErrorMessage("Veuillez sélectionner une plage de dates valide.");
      return;
    }
    if (endDate < startDate) {
      setErrorMessage("La date de fin doit être égale ou postérieure à la date de début.");
      return;
    }

    alert(`Réservation confirmée du ${startDate} au ${endDate} pour ${selectedEquipment.name}.`);
    closeModal();
  };

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
        {filteredData.length === 0 ? (
          <div className="inventory-status">Aucun équipement ne correspond à votre recherche.</div>
        ) : (
          filteredData.map((item) => (
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
              <p className="equipment-quantity">
                Quantité existante : <strong>{item.quantity}</strong>
              </p>
              <p className="equipment-note">
                Un matériel fiable et prêt à l'usage pour tes projets universitaires.
              </p>
              <button
                type="button"
                disabled={item.status !== "Available"}
                className="reserve-button"
                onClick={() => openModal(item)}
              >
                Réserver
              </button>
            </article>
          ))
        )}
      </section>

      {showModal && selectedEquipment && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <p className="modal-title">Confirmer la réservation</p>
                <h2>{selectedEquipment.name}</h2>
              </div>
              <button type="button" className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-label">Quantité disponible : {selectedEquipment.quantity}</p>
              <div className="modal-fields">
                <label>
                  Date de début
                  <input
                    type="date"
                    min={today}
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (e.target.value > endDate) {
                        setEndDate(e.target.value);
                      }
                    }}
                  />
                </label>
                <label>
                  Date de fin
                  <input
                    type="date"
                    min={startDate}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </label>
              </div>
              {errorMessage && <p className="modal-error">{errorMessage}</p>}
            </div>

            <div className="modal-actions">
              <button type="button" className="modal-button modal-cancel" onClick={closeModal}>
                Annuler
              </button>
              <button type="button" className="modal-button modal-confirm" onClick={handleConfirmReservation}>
                Confirmer la réservation
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default StudentCatalog;
