import React, { useState, useEffect } from "react";
import "./MyReservations.css";

/**
 * MyReservations – displays the current student's reservation history,
 * fetched live from the API.
 */
function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/reservations", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setReservations(data.data || []);
        } else {
          setErrorMessage(data.message || "Erreur lors du chargement.");
        }
      } catch {
        setErrorMessage("Impossible de charger vos réservations.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchReservations();
  }, []);

  const approvedReservations = reservations.filter(r => r.status === "approved");
  const activeReservations = approvedReservations.filter(
    r => r.startDate?.slice(0, 10) <= today && r.endDate?.slice(0, 10) >= today
  );
  const pendingReservations = reservations.filter(r => r.status === "pending");

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("fr-FR") : "N/A";

  const statusLabel = { approved: "Approuvée", pending: "En attente", refused: "Refusée", returned: "Retournée" };
  const statusClass = { approved: "approved", pending: "pending", refused: "refused", returned: "approved" };

  if (isLoading) {
    return (
      <main className="reservation-page">
        <section className="catalog-header">
          <h1>Mes réservations</h1>
        </section>
        <p className="empty-state">Chargement...</p>
      </main>
    );
  }

  return (
    <main className="reservation-page">
      <section className="catalog-header">
        <h1>Mes réservations</h1>
        <p className="catalog-description">Historique complet de vos réservations</p>
      </section>

      {errorMessage && <p className="empty-state error-message-state">{errorMessage}</p>}

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

        {reservations.length === 0 ? (
          <p className="empty-state">Aucune réservation pour le moment. Réservez un équipement pour en ajouter.</p>
        ) : (
          <div className="reservation-grid">
            {reservations.map((reservation) => (
              <article key={reservation._id} className="res-card">
                <div className="res-card-top">
                  <div className="res-card-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    </svg>
                  </div>
                  <div className="res-card-title-group">
                    <h3>{reservation.equipmentName || "Équipement"}</h3>
                    <span className="res-card-category">Matériel</span>
                  </div>
                  <span className={`res-badge ${statusClass[reservation.status] || "pending"}`}>
                    {statusLabel[reservation.status] || reservation.status}
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
                    <span>Début : {formatDate(reservation.startDate)}</span>
                  </div>
                  <div className="res-date-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>Fin : {formatDate(reservation.endDate)}</span>
                  </div>
                </div>

                <div className="res-footer-note">
                  {reservation.returnedAt
                    ? `Retourné le ${formatDate(reservation.returnedAt)}`
                    : "En cours / En attente"}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default MyReservations;
