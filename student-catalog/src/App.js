import './App.css';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import StudentCatalog from './components/StudentCatalog';
import MyReservations from './components/MyReservations';
import MonProfil from './components/MonProfil';
import MesPenalites from './components/MesPenalites';

function App() {
  const [activeView, setActiveView] = useState('catalog');
  const [reservations, setReservations] = useState([]);
  const [penalties] = useState([]);
  const user = {
    name: 'Meriem Ben',
    email: 'meriem.ben@example.com',
    phone: '+212 600-123-456',
  };

  const handleAddReservation = (reservation) => {
    setReservations((current) => [reservation, ...current]);
  };

  return (
    <div className="App">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <div className="student-dashboard">
        <aside className="student-sidebar">
          <div className="sidebar-header">
            <p className="sidebar-label">Espace Étudiant</p>
            <h2>Réservation matériel</h2>
          </div>

          <div className="sidebar-links">
            <button
              type="button"
              className={activeView === 'catalog' ? 'sidebar-link active' : 'sidebar-link'}
              onClick={() => setActiveView('catalog')}
            >
              Catalogue matériel
            </button>
            <button
              type="button"
              className={activeView === 'reservations' ? 'sidebar-link active' : 'sidebar-link'}
              onClick={() => setActiveView('reservations')}
            >
              Mes réservations
            </button>
            <button
              type="button"
              className={activeView === 'penalites' ? 'sidebar-link active' : 'sidebar-link'}
              onClick={() => setActiveView('penalites')}
            >
              Mes pénalités
            </button>
            <button
              type="button"
              className={activeView === 'profile' ? 'sidebar-link active' : 'sidebar-link'}
              onClick={() => setActiveView('profile')}
            >
              Mon profil
            </button>
          </div>

          <div className="sidebar-footer">
            <span>Connecté en tant que</span>
            <strong>{user.name}</strong>
          </div>
        </aside>

        <main className="student-main">
          {activeView === 'profile' ? (
            <MonProfil user={user} reservations={reservations} />
          ) : activeView === 'penalites' ? (
            <MesPenalites penalties={penalties} />
          ) : activeView === 'reservations' ? (
            <MyReservations reservations={reservations} />
          ) : (
            <StudentCatalog onAddReservation={handleAddReservation} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
