import React from "react";

function MonProfil({ user, reservations }) {
  const today = new Date().toISOString().split("T")[0];
  const totalReservations = reservations.length;
  const approvedReservations = reservations.filter((reservation) => reservation.status === "Approuvée");
  const pendingReservations = reservations.filter((reservation) => reservation.status === "En attente");
  const finishedReservations = reservations.filter((reservation) => reservation.status === "Terminée");
  const refusedReservations = reservations.filter((reservation) => reservation.status === "Refusée");
  const activeReservations = approvedReservations.filter(
    (reservation) => reservation.startDate <= today && reservation.endDate >= today
  );
  const penalties = reservations.filter((reservation) => reservation.penalties).length;

  return (
    <main className="profile-page">
      <section className="catalog-header">
        <div>
          <p className="catalog-tag">Mon profil</p>
          <h1>Informations personnelles et activité</h1>
          <p className="catalog-description">
            Consulte ton profil, tes statistiques de réservation et l'état de ton activité.
          </p>
        </div>
      </section>

      <section className="profile-section profile-info">
        <article className="profile-card">
          <h2>Informations personnelles</h2>
          <div className="profile-field">
            <span>Nom</span>
            <strong>{user.name}</strong>
          </div>
          <div className="profile-field">
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>
          <div className="profile-field">
            <span>Numéro</span>
            <strong>{user.phone}</strong>
          </div>
        </article>

        <article className="profile-card">
          <h2>Statistiques</h2>
          <div className="profile-field">
            <span>Total réservations</span>
            <strong>{totalReservations}</strong>
          </div>
          <div className="profile-field">
            <span>Réservations actives</span>
            <strong>{activeReservations.length}</strong>
          </div>
          <div className="profile-field">
            <span>Pénalités</span>
            <strong>{penalties}</strong>
          </div>
        </article>
      </section>

      <section className="activity-summary">
        <h2>Résumé d'activité</h2>
        <div className="activity-grid">
          <article className="activity-card activity-approved">
            <span>Réservations approuvées</span>
            <strong>{approvedReservations.length}</strong>
          </article>
          <article className="activity-card activity-pending">
            <span>Réservations en attente</span>
            <strong>{pendingReservations.length}</strong>
          </article>
          <article className="activity-card activity-finished">
            <span>Réservations terminées</span>
            <strong>{finishedReservations.length}</strong>
          </article>
          <article className="activity-card activity-refused">
            <span>Réservations refusées</span>
            <strong>{refusedReservations.length}</strong>
          </article>
        </div>
      </section>
    </main>
  );
}

export default MonProfil;
