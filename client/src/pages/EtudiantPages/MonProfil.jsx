import React from "react";
import "./MonProfil.css";

const normalizeStatus = (value) => {
  const raw = (value || "").toString().toLowerCase();
  if (raw.includes("approv") || raw.includes("approuv")) return "approved";
  if (raw.includes("refus")) return "refused";
  if (raw.includes("return") || raw.includes("retour")) return "returned";
  return "pending";
};

const isReservationActive = (reservation, today) => {
  return reservation.startDate <= today && reservation.endDate >= today;
};

function MonProfil({ user, reservations }) {
  const today = new Date().toISOString().split("T")[0];
  const normalizedReservations = reservations.map((reservation) => ({
    ...reservation,
    statusNormalized: normalizeStatus(reservation.status || reservation.statusLabel),
  }));
  const totalReservations = reservations.length;
  const approvedReservations = normalizedReservations.filter((reservation) => reservation.statusNormalized === "approved");
  const pendingReservations = normalizedReservations.filter((reservation) => reservation.statusNormalized === "pending");
  const finishedReservations = normalizedReservations.filter((reservation) => reservation.statusNormalized === "returned");
  const refusedReservations = normalizedReservations.filter((reservation) => reservation.statusNormalized === "refused");
  const activeReservations = approvedReservations.filter((reservation) =>
    isReservationActive(reservation, today)
  );
  // Count how many reservations match the penalty criteria
  const penaltiesCount = reservations.filter((reservation) => reservation.penalties).length;

  return (
    <main className="profile-page">
      <section className="catalog-header">
        <h1>Mon profil</h1>
        <p className="catalog-description">
          Informations personnelles et statistiques
        </p>
      </section>

      <section className="profile-info">
        <article className="profile-card">
          <div className="profile-card-header">
            <div className="profile-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="profile-name">
              <h2>{user.name}</h2>
              <p>Étudiant</p>
            </div>
          </div>

          <div className="profile-details-grid">
            <div className="profile-field-box">
              <svg className="profile-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <div className="profile-field-text">
                <span>Email</span>
                <strong>{user.email}</strong>
              </div>
            </div>
            <div className="profile-field-box">
              <svg className="profile-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="9" x2="20" y2="9" />
                <line x1="4" y1="15" x2="20" y2="15" />
                <line x1="10" y1="3" x2="8" y2="21" />
                <line x1="16" y1="3" x2="14" y2="21" />
              </svg>
              <div className="profile-field-text">
                <span>Numéro étudiant</span>
                <strong>E2024001</strong>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="profile-stats-section">
        <h3>Statistiques</h3>
        <div className="profile-stats-grid">
          <article className="profile-stat-card">
            <div className="stat-icon blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="stat-content">
              <span>Réservations totales</span>
              <strong>{totalReservations}</strong>
            </div>
          </article>

          <article className="profile-stat-card">
            <div className="stat-icon green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
            </div>
            <div className="stat-content">
              <span>Réservations actives</span>
              <strong>{activeReservations.length}</strong>
            </div>
          </article>

          <article className="profile-stat-card">
            <div className="stat-icon red">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div className="stat-content">
              <span>Pénalités</span>
              <strong>{penaltiesCount}</strong>
            </div>
          </article>
        </div>
      </section>

      <section className="activity-summary-container">
        <h3>Résumé d'activité</h3>
        <div className="activity-summary-list">
          <div className="activity-row approved">
            <span>Réservations approuvées</span>
            <strong>{approvedReservations.length}</strong>
          </div>
          <div className="activity-row pending">
            <span>Réservations en attente</span>
            <strong>{pendingReservations.length}</strong>
          </div>
          <div className="activity-row finished">
            <span>Réservations terminées</span>
            <strong>{finishedReservations.length}</strong>
          </div>
          <div className="activity-row refused">
            <span>Réservations refusées</span>
            <strong>{refusedReservations.length}</strong>
          </div>
        </div>
      </section>
    </main>
  );
}

export default MonProfil;
