import React, { useState, useEffect } from "react";
import "./StudentCatalog.css";

const today = new Date().toISOString().split("T")[0];

function StudentCatalog({ onAddReservation }) {
  const [equipmentData, setEquipmentData] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/equipment', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await response.json();
        
        if (result.success) {
          setEquipmentData(result.data);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération du catalogue:", err);
        setErrorMessage("Impossible de charger le catalogue.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEquipment();
  }, []);

  const filteredData = equipmentData.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || item.category === category;
    return matchesSearch && matchesCategory;
  });

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

    const status = startDate > today ? "En attente" : "Approuvée";
    const reservation = {
      id: Date.now(),
      equipmentId: selectedEquipment._id,
      name: selectedEquipment.name,
      startDate,
      endDate,
      status,
    };

    if (onAddReservation) {
      onAddReservation(reservation);
    }

    alert(`Réservation confirmée du ${startDate} au ${endDate} pour ${selectedEquipment.name}.`);
    closeModal();
  };

  return (
    <main className="catalog-page">
      <section className="catalog-header">
        <h1>Catalogue matériel</h1>
        <p className="catalog-description">
          Parcourez et réservez le matériel disponible
        </p>
      </section>

      <section className="catalog-toolbar">
        <div className="catalog-search-wrapper">
          <svg className="catalog-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher du matériel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <select className="catalog-filter" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">Toutes les catégories</option>
          <option value="computers">Ordinateurs</option>
          <option value="projectors">Projecteurs</option>
          <option value="electronics">Électronique</option>
        </select>
      </section>

      <section className="equipment-grid">
        {isLoading ? (
          <div className="inventory-status">Chargement du matériel...</div>
        ) : filteredData.length === 0 ? (
          <div className="inventory-status">Aucun équipement ne correspond à votre recherche.</div>
        ) : (
          filteredData.map((item) => (
            <article key={item._id} className="equipment-card">
              <div className="equipment-card-top">
                <span className="equipment-emoji">{item.emoji}</span>
                <span
                  className={`status-badge ${item.status === "Available" ? "status-available" : "status-unavailable"
                    }`}
                >
                  {item.status === "Available" ? "Disponible" : "Indisponible"}
                </span>
              </div>
              <h2>{item.name}</h2>
              <p className="equipment-note">
                {item.description}
              </p>
              <span className="common-tag">Matériel</span>
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
