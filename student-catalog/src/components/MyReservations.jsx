import React from "react";

function MyReservations({ reservations }) {
  const today = new Date().toISOString().split("T")[0];
  const approvedReservations = reservations.filter((reservation) => reservation.status === "Approuvée");
  const activeReservations = approvedReservations.filter(
    (reservation) => reservation.startDate <= today && reservation.endDate >= today
  );
  const pendingReservations = reservations.filter(
    (reservation) => reservation.status === "En attente" || reservation.startDate > today
  );

  return (
    <main className="reservation-page">
      <section className="catalog-header">
        <div>
          <p className="catalog-tag">Mes Réservations</p>
          <h1>Suivi de tes réservations</h1>
          <p className="catalog-description">
            Consulte le nombre de réservations actives, en attente et le total de toutes tes demandes.
          </p>
        </div>
      </section>

      <section className="reservation-stats">
        <article className="stat-card stat-active">
          <span>Réservations actives</span>
          <strong>{activeReservations.length}</strong>
        </article>
        <article className="stat-card stat-total">
          <span>Total réservations</span>
          <strong>{reservations.length}</strong>
        </article>
        <article className="stat-card stat-pending">
          <span>En attente</span>
          <strong>{pendingReservations.length}</strong>
        </article>
      </section>

      <section className="reservation-list">
        <h2>Liste des réservations</h2>
        {reservations.length === 0 ? (
          <p className="empty-state">Aucune réservation pour le moment. Réserve un équipement pour en ajouter.</p>
        ) : (
          <div className="reservation-grid">
            {reservations.map((reservation) => (
              <article key={reservation.id} className="reservation-card">
                <h3>{reservation.name}</h3>
                <div className="reservation-meta">
                  <span className={`reservation-badge ${reservation.status === "Active" ? "active" : "pending"}`}>
                    {reservation.status}
                  </span>
                  <span>{reservation.startDate} → {reservation.endDate}</span>
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
