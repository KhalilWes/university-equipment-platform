import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Etudiant from './pages/Etudiant'
import Admin from './pages/Admin'
import Technicien from './pages/Technicien'
import SignIn from './pages/SignIn'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/signin" element={<SignIn />} />

                <Route path="/Etudiant" element={<ProtectedRoute requiredRole="Student"><Etudiant /></ProtectedRoute>} />

                <Route path="/Admin" element={<ProtectedRoute requiredRole="Admin"><Admin /></ProtectedRoute>} />

                <Route path="/Technicien" element={<ProtectedRoute requiredRole="Technician"><Technicien /></ProtectedRoute>} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
