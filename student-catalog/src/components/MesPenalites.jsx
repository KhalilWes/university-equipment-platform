import React from "react";

function MesPenalites({ penalties }) {
  const totalPenalties = penalties.length;
  const totalAmount = penalties.reduce((sum, item) => sum + item.amount, 0);

  return (
    <main className="penalty-page">
      <section className="catalog-header">
        <div>
          <p className="catalog-tag">Mes pénalités</p>
          <h1>Historique et montant de vos amendes</h1>
          <p className="catalog-description">
            Consulte ton historique de pénalités et découvre comment éviter les prochaines amendes.
          </p>
        </div>
      </section>

      <section className="penalty-summary">
        <article className="penalty-card">
          <span>Nombre de pénalités</span>
          <strong>{totalPenalties}</strong>
        </article>
        <article className="penalty-card penalty-total">
          <span>Montant total</span>
          <strong>{totalAmount} €</strong>
        </article>
      </section>

      <section className="penalty-history">
        <h2>Historique de vos pénalités</h2>
        {penalties.length === 0 ? (
          <p className="empty-state">Aucune pénalité enregistrée pour le moment.</p>
        ) : (
          penalties.map((penalty) => (
            <div key={penalty.id} className="penalty-item">
              <div className="penalty-item-header">
                <div>
                  <p className="penalty-status">⏰ {penalty.type}</p>
                  <h3>{penalty.title}</h3>
                </div>
                <div className="penalty-amount">{penalty.amount} €</div>
              </div>
              <div className="penalty-item-meta">{penalty.date}</div>
            </div>
          ))
        )}
      </section>

      <section className="penalty-advice">
        <h2>Comment éviter les pénalités ?</h2>
        <ul>
          <li>Retournez toujours le matériel à la date et l'heure prévues.</li>
          <li>Manipulez le matériel avec précaution.</li>
          <li>Signalez immédiatement tout problème à l'administration.</li>
          <li>Vérifiez l'état du matériel avant et après utilisation.</li>
        </ul>
      </section>
    </main>
  );
}

export default MesPenalites;
