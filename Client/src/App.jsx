import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Etudiant from './pages/Etudiant'
import Admin from './pages/Admin'
import Technicien from './pages/Technicien'
import SignIn from './pages/SignIn'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/signin" element={<SignIn />} />

                <Route path="/Etudiant" element={<Etudiant />} />

                <Route path="/Admin" element={<Admin />} />

                <Route path="/Technicien" element={<Technicien />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
