import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import "./MyReservations.css";

const normalizeStatus = (value) => {
  const raw = (value || "").toString().toLowerCase();
  if (raw.includes("approv") || raw.includes("approuv")) return "Approuvée";
  if (raw.includes("refus")) return "Refusée";
  if (raw.includes("return") || raw.includes("retour")) return "Terminée";
  return "En attente";
};

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const token = localStorage.getItem("token");
        const userRaw = localStorage.getItem("user");
        const user = userRaw ? JSON.parse(userRaw) : null;
        const studentId = user?.id;

        if (!token || !studentId) {
          setReservations([]);
          const message = "Impossible de charger vos réservations.";
          setErrorMessage(message);
          toast.error(message);
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/reservations/student/${studentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success) {
          setReservations([]);
          const message = result.message || "Erreur lors du chargement des réservations.";
          setErrorMessage(message);
          toast.error(message);
          return;
        }

        setReservations(result.data || []);
      } catch (error) {
        setReservations([]);
        const message = "Erreur réseau lors du chargement des réservations.";
        setErrorMessage(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const normalizedReservations = reservations.map((reservation) => ({
    ...reservation,
    statusLabel: normalizeStatus(reservation.status),
  }));

  const approvedReservations = normalizedReservations.filter(
    (reservation) => reservation.statusLabel === "Approuvée"
  );
  const activeReservations = approvedReservations.filter(
    (reservation) => reservation.startDate <= today && reservation.endDate >= today
  );
  const pendingReservations = normalizedReservations.filter(
    (reservation) => reservation.statusLabel === "En attente"
  );

  return (
    <main className="reservation-page">
      <section className="catalog-header">
        <h1>Mes réservations</h1>
        <p className="catalog-description">
          Historique complet de vos réservations
        </p>
      </section>

      <section className="reservation-stats-grid">
        <article className="res-stat-card stat-active">
          <span>Réservations actives</span>
          <strong>{activeReservations.length}</strong>
        </article>
        <article className="res-stat-card stat-total">
          <span>Total réservations</span>
          <strong>{reservations.length}</strong>
        </article>
        <article className="res-stat-card stat-pending">
          <span>En attente</span>
          <strong>{pendingReservations.length}</strong>
        </article>
      </section>

      {loading && (
        <div className="reservation-skeleton-grid">
          {Array.from({ length: 3 }).map((_, index) => (
            <article key={`reservation-skeleton-${index}`} className="res-card reservation-skeleton-card">
              <div className="res-card-top">
                <div className="reservation-skeleton-box reservation-skeleton-icon" />
                <div className="reservation-skeleton-head">
                  <div className="reservation-skeleton-box reservation-skeleton-title" />
                  <div className="reservation-skeleton-box reservation-skeleton-subtitle" />
                </div>
                <div className="reservation-skeleton-box reservation-skeleton-badge" />
              </div>

              <div className="res-dates">
                <div className="reservation-skeleton-box reservation-skeleton-line" />
                <div className="reservation-skeleton-box reservation-skeleton-line" />
              </div>

              <div className="reservation-skeleton-box reservation-skeleton-footer" />
            </article>
          ))}
        </div>
      )}

      {!loading && errorMessage && (
        <div className="reservation-error-state">{errorMessage}</div>
      )}

      <section className="reservation-list">
        <div className="reservation-list-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <h2>Toutes les réservations</h2>
        </div>

        {!loading && !errorMessage && normalizedReservations.length === 0 ? (
          <p className="empty-state">Aucune réservation pour le moment. Réserve un équipement pour en ajouter.</p>
        ) : !loading && !errorMessage ? (
          <div className="reservation-grid">
            {normalizedReservations.map((reservation) => (
              <article key={reservation._id || reservation.id} className="res-card">
                <div className="res-card-top">
                  <div className="res-card-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    </svg>
                  </div>
                  <div className="res-card-title-group">
                    <h3>{reservation.equipmentName || reservation.name || "Matériel"}</h3>
                    <span className="res-card-category">Matériel</span>
                  </div>
                  <span className={`res-badge ${reservation.statusLabel === "Approuvée" ? "approved" : reservation.statusLabel === "Refusée" ? "refused" : "pending"}`}>
                    {reservation.statusLabel}
                  </span>
                </div>

                <div className="res-dates">
                  <div className="res-date-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>{formatDate(reservation.startDate)}</span>
                  </div>
                  <div className="res-date-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>{formatDate(reservation.endDate)}</span>
                  </div>
                </div>

                <div className="res-footer-note">
                  Projet scolaire / Présentation
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}

export default MyReservations;
