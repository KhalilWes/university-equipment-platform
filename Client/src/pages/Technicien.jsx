import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Technicien.css';

import Tableau from './TechnicienPages/Tableau';
import Maintenance from './TechnicienPages/Maintenance';
import Profil from './TechnicienPages/Profil';

/**
 * Technicien – layout principal.
 * Structure : sidebar 20 % (vert foncé, style maquette) | zone de contenu 80 %
 * Utilise useState pour la navigation entre pages (pas de sous-routes).
 */
export default function Technicien() {
    const navigate = useNavigate();

    // Page active : 'Tableau' par défaut
    const [activePage, setActivePage] = useState('Tableau');

    // Récupération de l'utilisateur connecté via backend/localStorage
    const storedUserStr = localStorage.getItem('user');
    const storedUser = storedUserStr ? JSON.parse(storedUserStr) : {};
    const techName = storedUser.username || "Jean Dupont";

    // Retourne le composant correspondant à la page active
    const renderPage = () => {
        switch (activePage) {
            case 'Tableau': return <Tableau />;
            case 'Maintenance': return <Maintenance />;
            case 'Profil': return <Profil />;
            default: return <Tableau />;
        }
    };

    // Helper : classe CSS selon si l'item est actif
    const navClass = (page) =>
        'nav-item' + (activePage === page ? ' active' : '');

    return (
        <div className="technician-layout">

            {/* ── SIDEBAR ── */}
            <aside className="sidebar">

                {/* Logo + titre */}
                <div className="sidebar-brand">
                    <div className="brand-icon">
                        {/* Icône mortier de diplôme (chapeau académique) */}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 3L2 9l10 6 10-6-10-6z" />
                            <path d="M2 17l10 6 10-6" />
                            <path d="M2 13l10 6 10-6" />
                        </svg>
                    </div>
                    <div className="brand-text">
                        <span className="brand-title">Technicien</span>
                        <span className="brand-sub">Gestion Maintenance</span>
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

                    {/* Maintenance */}
                    <button className={navClass('Maintenance')} onClick={() => setActivePage('Maintenance')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77z" />
                        </svg>
                        Maintenance
                    </button>

                    {/* Mon profil */}
                    <button className={navClass('Profil')} onClick={() => setActivePage('Profil')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        Mon profil
                    </button>

                </nav>

                {/* Carte utilisateur */}
                <div className="sidebar-user">
                    <p className="user-label">Connecté en tant que</p>
                    <p className="user-name">{techName}</p>
                    <p className="user-id">Informatique et Électronique</p>
                </div>

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

            {/* ── CONTENU PRINCIPAL – remplacé à chaque clic de nav ── */}
            <main className="main-content">
                {renderPage()}
            </main>

        </div>
    );
}