import './App.css';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import StudentCatalog from './components/StudentCatalog';
import AdminInventory from './components/AdminInventory';

function App() {
  const [activeView, setActiveView] = useState('catalog');

  return (
    <div className="App">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <nav className="app-nav">
        <button
          type="button"
          className={activeView === 'catalog' ? 'nav-button active' : 'nav-button'}
          onClick={() => setActiveView('catalog')}
        >
          Student Catalog
        </button>
        <button
          type="button"
          className={activeView === 'admin' ? 'nav-button active' : 'nav-button'}
          onClick={() => setActiveView('admin')}
        >
          Admin Inventory
        </button>
      </nav>
      {activeView === 'admin' ? <AdminInventory /> : <StudentCatalog />}
    </div>
  );
}

export default App;
