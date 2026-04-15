import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

import Tableau     from './AdminPages/Tableau';
import Etudiant    from './AdminPages/Etudiant';
import Materiel    from './AdminPages/Materiel';
import Reservation from './AdminPages/Reservation';
import Maintenance from './AdminPages/Maintenance';
import Penalite    from './AdminPages/Penalite';

/**
 * Admin – layout principal.
 * Structure : sidebar navy (20 %) + zone de contenu (80 %).
 * Navigation par useState, sans sous-routes.
 */
export default function Admin() {
    const navigate = useNavigate();

    // Page active par défaut
    const [activePage, setActivePage] = useState('Tableau');

    // Retourne le composant correspondant à la page active
    const renderPage = () => {
        switch (activePage) {
            case 'Tableau':      return <Tableau />;
            case 'Etudiants':    return <Etudiant />;
            case 'Materiels':    return <Materiel />;
            case 'Reservations': return <Reservation />;
            case 'Maintenances': return <Maintenance />;
            case 'Penalites':    return <Penalite />;
            default:             return <Tableau />;
        }
    };

    // Helper : classe CSS selon si l'item est actif
    const navClass = (page) =>
        'nav-item' + (activePage === page ? ' active' : '');

    return (
        <div className="admin-layout">

            {/* ── SIDEBAR ── */}
            <aside className="sidebar">

                {/* Logo + titre */}
                <div className="sidebar-brand">
                    <div className="brand-icon">
                        {/* Icône chapeau académique */}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 3L2 9l10 6 10-6-10-6z" />
                            <path d="M2 17l10 6 10-6" />
                            <path d="M2 13l10 6 10-6" />
                        </svg>
                    </div>
                    <div className="brand-text">
                        <span className="brand-title">Admin Panel</span>
                        <span className="brand-sub">Gestion Matériel</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">

                    {/* Tableau de bord */}
                    <button className={navClass('Tableau')} onClick={() => setActivePage('Tableau')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" />
                            <rect x="14" y="14" width="7" height="7" rx="1" />
                        </svg>
                        Tableau de bord
                    </button>

                    {/* Étudiants – icône profil groupe */}
                    <button className={navClass('Etudiants')} onClick={() => setActivePage('Etudiants')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        Étudiants
                    </button>

                    {/* Matériel – icône boîte / colis */}
                    <button className={navClass('Materiels')} onClick={() => setActivePage('Materiels')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                            <line x1="12" y1="22.08" x2="12" y2="12" />
                        </svg>
                        Matériel
                    </button>

                    {/* Réservations – icône calendrier */}
                    <button className={navClass('Reservations')} onClick={() => setActivePage('Reservations')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        Réservations
                    </button>

                    {/* Maintenance – icône clé à molette */}
                    <button className={navClass('Maintenances')} onClick={() => setActivePage('Maintenances')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77z" />
                        </svg>
                        Maintenance
                    </button>

                    {/* Pénalités – icône triangle avertissement */}
                    <button className={navClass('Penalites')} onClick={() => setActivePage('Penalites')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        Pénalités
                    </button>

                </nav>

                {/* Séparateur */}
                <hr className="sidebar-divider" />

                {/* Déconnexion */}
                <button
                    className="btn-disconnect"
                    onClick={() => {
                        localStorage.removeItem('isLoggedIn');
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        navigate('/');
                    }}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Déconnexion
                </button>

            </aside>

            {/* ── CONTENU PRINCIPAL ── */}
            <main className="main-content">
                {renderPage()}
            </main>

        </div>
    );
}