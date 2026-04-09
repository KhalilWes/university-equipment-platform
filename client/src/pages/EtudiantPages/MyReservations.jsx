import React from "react";
import "./MyReservations.css";

function MyReservations({ reservations }) {
  const today = new Date().toISOString().split("T")[0];
  const approvedReservations = reservations.filter((reservation) => reservation.status === "Approuvée");
  const activeReservations = approvedReservations.filter(
    (reservation) => reservation.startDate <= today && reservation.endDate >= today
  );
  // Unify pending logic to only check the actual status
  const pendingReservations = reservations.filter(
    (reservation) => reservation.status === "En attente"
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
          <p className="empty-state">Aucune réservation pour le moment. Réserve un équipement pour en ajouter.</p>
        ) : (
          <div className="reservation-grid">
            {reservations.map((reservation) => (
              <article key={reservation.id} className="res-card">
                <div className="res-card-top">
                  <div className="res-card-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    </svg>
                  </div>
                  <div className="res-card-title-group">
                    <h3>{reservation.name}</h3>
                    <span className="res-card-category">Matériel</span>
                  </div>
                  <span className={`res-badge ${reservation.status === "Approuvée" ? "approved" : reservation.status === "Refusée" ? "refused" : "pending"}`}>
                    {reservation.status}
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
                    <span>{reservation.startDate} 10:00</span>
                  </div>
                  <div className="res-date-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>{reservation.endDate} 18:00</span>
                  </div>
                </div>

                <div className="res-footer-note">
                  Projet scolaire / Présentation
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
