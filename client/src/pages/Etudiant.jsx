import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Etudiant.css';

import StudentCatalog from './EtudiantPages/StudentCatalog';
import MesPenalites from './EtudiantPages/MesPenalites';
import MyReservations from './EtudiantPages/MyReservations';
import MonProfil from './EtudiantPages/MonProfil';

/**
 * Etudiant – layout principal.
 * Structure : sidebar 20 % (nav boutons) | zone de contenu 80 % (rendu par state)
 * Utilise useState au lieu de Routes pour éviter tout problème de superposition.
 */
export default function Etudiant() {
    const navigate = useNavigate();

    // Page active : 'Profil' par défaut
    const [activePage, setActivePage] = useState('Profil');

    const [reservations, setReservations] = useState([]);
    const [penalties, setPenalties] = useState([
        { id: 1, type: "Retard", title: "Appareil photo en retard", amount: 15, date: "2023-11-01" }
    ]);

    // Récupérer l'utilisateur depuis le LocalStorage (issu du backend après login/register)
    const storedUserStr = localStorage.getItem('user');
    const storedUser = storedUserStr ? JSON.parse(storedUserStr) : {};

    const user = {
        name: storedUser.username || "Sophie Martin",
        email: storedUser.email || "sophie.martin@etu.univ.fr",
        phone: "06 12 34 56 78" // Valeur par défaut car pas géré dans la DB actuelle
    };

    const handleAddReservation = (res) => {
        setReservations([...reservations, res]);
    };

    // Retourne le composant correspondant à la page active
    const renderPage = () => {
        switch (activePage) {
            case 'Catalogue': return <StudentCatalog onAddReservation={handleAddReservation} />;
            case 'reservation': return <MyReservations reservations={reservations} />;
            case 'Penalite': return <MesPenalites penalties={penalties} />;
            case 'Profil': return <MonProfil user={user} reservations={reservations} />;
            default: return <MonProfil user={user} reservations={reservations} />;
        }
    };

    // Helper : classe CSS selon si l'item est actif
    const navClass = (page) =>
        'nav-item' + (activePage === page ? ' active' : '');

    return (
        <div className="etudiant-layout">

            {/* ── SIDEBAR ── */}
            <aside className="sidebar">

                {/* Logo + titre */}
                <div className="sidebar-brand">
                    <div className="brand-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 3L2 9l10 6 10-6-10-6z" />
                            <path d="M2 17l10 6 10-6" />
                            <path d="M2 13l10 6 10-6" />
                        </svg>
                    </div>
                    <div className="brand-text">
                        <span className="brand-title">Espace<br />Étudiant</span>
                        <span className="brand-sub">Réservation matériel</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">

                    <button className={navClass('Profil')} onClick={() => setActivePage('Profil')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        Mon profil
                    </button>

                    <button className={navClass('Catalogue')} onClick={() => setActivePage('Catalogue')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        </svg>
                        Catalogue matériel
                    </button>

                    <button className={navClass('reservation')} onClick={() => setActivePage('reservation')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        Mes réservations
                    </button>

                    <button className={navClass('Penalite')} onClick={() => setActivePage('Penalite')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        Mes pénalités
                    </button>

                </nav>

                {/* Carte utilisateur */}
                <div className="sidebar-user">
                    <p className="user-label">Connecté en tant que</p>
                    <p className="user-name">{user.name}</p>
                    <p className="user-id">Étudiant (Connecté)</p>
                </div>

                {/* Déconnexion */}
                <button className="btn-disconnect" onClick={() => {
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/');
                }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Déconnexion
                </button>

            </aside>

            {/* ── CONTENU PRINCIPAL – remplace l'ancien contenu à chaque clic ── */}
            <main className="main-content">
                {renderPage()}
            </main>

        </div>
    );
}