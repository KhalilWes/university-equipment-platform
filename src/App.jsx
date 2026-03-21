import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'

// ─── Add new page imports here ───────────────────────────────────────────────
// import Dashboard from './pages/Dashboard'
// import Profile   from './pages/Profile'
// ─────────────────────────────────────────────────────────────────────────────

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login page ─ shown at the root URL "/" */}
        <Route path="/" element={<Login />} />

        {/* ── Add new routes below ──────────────────────────────────────── */}
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        {/* <Route path="/profile"   element={<Profile />}   /> */}
        {/* ─────────────────────────────────────────────────────────────── */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
