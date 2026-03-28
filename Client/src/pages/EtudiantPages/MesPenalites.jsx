import React from "react";
import "./MesPenalites.css";

function MesPenalites({ penalties }) {
  const totalPenalties = penalties.length;
  const totalAmount = penalties.reduce((sum, item) => sum + item.amount, 0);

  return (
    <main className="penalty-page">
      <section className="catalog-header">
        <h1>Mes pénalités</h1>
        <p className="catalog-description">
          Historique de vos pénalités et amendes
        </p>
      </section>

      <section className="penalty-summary">
        <article className="penalty-stat-card">
          <div className="penalty-stat-icon red">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="penalty-stat-text">
            <span>Nombre de pénalités</span>
            <strong>{totalPenalties}</strong>
          </div>
        </article>

        <article className="penalty-stat-card">
          <div className="penalty-stat-icon orange">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <div className="penalty-stat-text orange-text">
            <span>Montant total</span>
            <strong>{totalAmount} €</strong>
          </div>
        </article>
      </section>

      <section className="penalty-history">
        {penalties.length === 0 ? (
          <p className="empty-state">Aucune pénalité enregistrée pour le moment.</p>
        ) : (
          <div className="penalty-grid">
            {penalties.map((penalty) => (
              <div key={penalty.id} className="penalty-card">
                <div className="penalty-card-top">
                  <span className="penalty-emoji">⏰</span>
                  <span className="penalty-badge">{penalty.type}</span>
                </div>
                <h3>{penalty.title}</h3>
                <div className="penalty-card-footer">
                  <div className="penalty-date">{penalty.date}</div>
                  <div className="penalty-amount">{penalty.amount} €</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="penalty-advice">
        <h2>Comment éviter les pénalités ?</h2>
        <ul>
          <li>Retournez toujours le matériel à la date et l'heure prévues</li>
          <li>Manipulez le matériel avec précaution</li>
          <li>Signalez immédiatement tout problème à l'administration</li>
          <li>Vérifiez l'état du matériel avant et après utilisation</li>
        </ul>
      </section>
    </main>
  );
}

export default MesPenalites;
