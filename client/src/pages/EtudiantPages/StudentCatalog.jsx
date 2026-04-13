import React, { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import toast from "react-hot-toast";
import "react-day-picker/dist/style.css";
import "./StudentCatalog.css";

const toInputDate = (date) => {
  if (!date) return "";
  return date.toISOString().split("T")[0];
};

const formatDate = (date) => {
  if (!date) return "";
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

function StudentCatalog({ onAddReservation }) {
  const [equipmentData, setEquipmentData] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [dateRange, setDateRange] = useState(undefined);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizeCategory = (value) => (value || "").toString().trim().toLowerCase();
  const formatCategoryLabel = (value) => {
    if (!value) return "";
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

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

  const isItemAvailable = (item) => {
    const quantity = Number(item.quantity) || 0;
    return quantity > 0 && item.status !== "Maintenance";
  };

  const filteredData = equipmentData.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      category === "all" || normalizeCategory(item.category) === category;
    return matchesSearch && matchesCategory;
  });

  const categoryOptions = [
    ...new Set(
      equipmentData
        .map((item) => normalizeCategory(item.category))
        .filter(Boolean)
    ),
  ];

  const openModal = (item) => {
    if (!isItemAvailable(item)) {
      setErrorMessage("Cet équipement n'est pas disponible pour le moment.");
      toast.error("Cet équipement n'est pas disponible pour le moment.");
      return;
    }

    setSelectedEquipment(item);
    setShowModal(true);
    setDateRange(undefined);
    setErrorMessage("");
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEquipment(null);
    setErrorMessage("");
  };

  const handleConfirmReservation = async () => {
    if (!selectedEquipment) return;
    if (!dateRange?.from || !dateRange?.to) {
      setErrorMessage("Veuillez sélectionner une plage de dates valide.");
      return;
    }
    if (dateRange.to < dateRange.from) {
      setErrorMessage("La date de fin doit être égale ou postérieure à la date de début.");
      return;
    }

    const startDate = toInputDate(dateRange.from);
    const endDate = toInputDate(dateRange.to);

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          equipmentId: selectedEquipment._id,
          startDate,
          endDate,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        const message = result.message || "Impossible de créer la réservation.";
        setErrorMessage(message);
        toast.error(message);
        return;
      }

      if (onAddReservation) {
        const created = result.data || {};
        onAddReservation({
          id: created._id || Date.now(),
          equipmentId: selectedEquipment._id,
          name: selectedEquipment.name,
          startDate: created.startDate || startDate,
          endDate: created.endDate || endDate,
          status: created.status || "pending",
        });
      }

      closeModal();
      toast.success("Réservation créée avec succès.");
    } catch (err) {
      const message = "Erreur réseau lors de la réservation.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
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
          {categoryOptions.map((itemCategory) => (
            <option key={itemCategory} value={itemCategory}>
              {formatCategoryLabel(itemCategory)}
            </option>
          ))}
        </select>
      </section>

      <section className="equipment-grid">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <article key={`skeleton-${index}`} className="equipment-card equipment-card-skeleton">
              <div className="equipment-card-top">
                <div className="skeleton-box skeleton-media" />
                <div className="skeleton-box skeleton-badge" />
              </div>
              <div className="skeleton-box skeleton-title" />
              <div className="skeleton-box skeleton-line" />
              <div className="skeleton-box skeleton-line short" />
              <div className="skeleton-box skeleton-tag" />
              <div className="skeleton-box skeleton-button" />
            </article>
          ))
        ) : filteredData.length === 0 ? (
          <div className="inventory-status">Aucun équipement ne correspond à votre recherche.</div>
        ) : (
          filteredData.map((item) => (
            <article key={item._id} className="equipment-card">
              <div className="equipment-card-top">
                <div className="equipment-media">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="equipment-image"
                      loading="lazy"
                    />
                  ) : (
                    <span className="equipment-emoji">{item.emoji}</span>
                  )}
                </div>
                <span
                  className={`status-badge ${isItemAvailable(item) ? "status-available" : "status-unavailable"
                    }`}
                >
                  {isItemAvailable(item) ? "Disponible" : "Indisponible"}
                </span>
              </div>
              <h2>{item.name}</h2>
              <p className="equipment-note">
                {item.description}
              </p>
              <span className="common-tag">Matériel</span>
              <button
                type="button"
                disabled={!isItemAvailable(item)}
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
        <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={closeModal}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
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
                  <div className="date-range-wrapper">
                    <DayPicker
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      disabled={{ before: new Date() }}
                      numberOfMonths={1}
                      defaultMonth={new Date()}
                      className="student-day-picker"
                    />
                  </div>
                </label>
              </div>
              <p className="modal-label">
                Période sélectionnée : {dateRange?.from ? formatDate(dateRange.from) : "—"}
                {dateRange?.to ? ` au ${formatDate(dateRange.to)}` : ""}
              </p>
              {errorMessage && <p className="modal-error">{errorMessage}</p>}
            </div>

            <div className="modal-actions">
              <button type="button" className="modal-button modal-cancel" onClick={closeModal}>
                Annuler
              </button>
              <button
                type="button"
                className="modal-button modal-confirm"
                onClick={handleConfirmReservation}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Envoi..." : "Confirmer la réservation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default StudentCatalog;
