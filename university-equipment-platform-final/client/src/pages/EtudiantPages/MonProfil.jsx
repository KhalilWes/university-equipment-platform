import React, { useState, useEffect } from "react";
import "./MonProfil.css";

/**
 * MonProfil – shows the authenticated student's profile and statistics.
 * All data is fetched live from the API.
 */
function MonProfil() {
  const [user, setUser] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [penalties, setPenalties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  const roleLabel = (role) => {
    if (role === "Admin") return "Administrateur";
    if (role === "Technicien") return "Technicien";
    if (role === "Student") return "Étudiant";
    return role || "Étudiant";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch user identity + reservations + penalties in parallel
        const [meRes, resRes, penRes] = await Promise.all([
          fetch("http://localhost:5000/api/auth/me", { headers }),
          fetch("http://localhost:5000/api/reservations", { headers }),
          fetch("http://localhost:5000/api/penalties", { headers }),
        ]);

        const [meData, resData, penData] = await Promise.all([
          meRes.json(),
          resRes.json(),
          penRes.json(),
        ]);

        // Build user info directly from /me endpoint, then fallback to localStorage when needed.
        let userName = "Étudiant";
        let userEmail = "—";
        let userRole = "Student";
        let userFirstName = "";
        let userLastName = "";

        if (meData?.success && meData?.user) {
          const userObj = meData.user;
          userRole = userObj.role || "Student";
          userName = userObj.username || "Étudiant";
          userEmail = userObj.email || "—";
          userFirstName = userObj.firstName || "";
          userLastName = userObj.lastName || "";
        }

        if (userName === "Étudiant" || userEmail === "—") {
          const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
          userName = userName === "Étudiant" ? (storedUser.username || "Étudiant") : userName;
          userEmail = userEmail === "—" ? (storedUser.email || "—") : userEmail;
          userRole = storedUser.role || userRole;
        }

        setUser({ name: userName, email: userEmail, role: userRole, firstName: userFirstName, lastName: userLastName });

        if (resData.success) setReservations(resData.data || []);
        if (penData.success) setPenalties(penData.data || []);
      } catch (err) {
        console.error("Erreur profil:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <main className="profile-page">
        <section className="catalog-header"><h1>Mon profil</h1></section>
        <p className="catalog-description">Chargement...</p>
      </main>
    );
  }

  const totalReservations = reservations.length;
  const approvedReservations = reservations.filter(r => r.status === "approved");
  const pendingReservations = reservations.filter(r => r.status === "pending");
  const finishedReservations = reservations.filter(r => r.status === "returned");
  const refusedReservations = reservations.filter(r => r.status === "refused");
  const activeReservations = approvedReservations.filter(
    r => r.startDate?.slice(0, 10) <= today && r.endDate?.slice(0, 10) >= today
  );
  const penaltiesCount = penalties.length;

  return (
    <main className="profile-page">
      <section className="catalog-header">
        <h1>Mon profil</h1>
        <p className="catalog-description">Informations personnelles et statistiques</p>
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
              <h2>{user?.name || "Étudiant"}</h2>
              <p>{roleLabel(user?.role)}</p>
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
                <strong>{user?.email || "—"}</strong>
              </div>
            </div>
            <div className="profile-field-box">
              <svg className="profile-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <div className="profile-field-text">
                <span>Rôle</span>
                <strong>{roleLabel(user?.role)}</strong>
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
            <span>Réservations retournées</span>
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
