import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './Login.css'

function Login() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();
            setIsLoading(false);

            if (response.ok && data.token) {
                // Vérifier si le rôle correspond à ce qui a été choisi, facultatif mais bonne pratique
                // (Le backend gère actuellement le rôle, donc on pourrait se fier à data.user.role)
                
                // Mettre à jour le localStorage
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('token', data.token);
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                }

                // Gérer la redirection selon le rôle choisi par l'utilisateur
                if (role === 'etudiant') {
                    navigate('/Etudiant')
                } else if (role === 'admin') {
                    navigate('/Admin')
                } else if (role === 'technicien') {
                    navigate('/Technicien')
                } else {
                    // Fallback
                    if (data.user.role === 'Student') navigate('/Etudiant')
                    else if (data.user.role === 'Admin') navigate('/Admin')
                    else if (data.user.role === 'Technician') navigate('/Technicien')
                }
            } else {
                setError(data.message || 'Identifiants ou rôle incorrects');
            }
        } catch (err) {
            setIsLoading(false);
            setError('Erreur de connexion au serveur backend');
        }
    }

    return (
        <div className="page-wrapper">
            <div className="login-card">
                <div className="icon-circle">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white">
                        <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6L23 9 12 3zm0 2.21L19.32 9 12 12.79 4.68 9 12 5.21zM17 15.99l-5 2.73-5-2.73v-3.73L12 15l5-2.74v3.73z" />
                    </svg>
                </div>

                <h1 className="title">Gestion Matériel Universitaire</h1>
                <p className="subtitle">Connectez-vous à votre compte</p>

                {error && (
                    <div style={{
                        color: '#e53e3e',
                        backgroundColor: '#fed7d7',
                        padding: '10px',
                        borderRadius: '4px',
                        marginBottom: '15px',
                        fontSize: '14px',
                        textAlign: 'center',
                        width: '100%'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="role">Rôle</label>
                        <div className="input-wrapper">
                            <span className="input-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a0aec0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </span>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="form-select"
                                required
                            >
                                <option value="" disabled>Choisissez votre rôle</option>
                                <option value="etudiant">Étudiant</option>
                                <option value="admin">Admin</option>
                                <option value="technicien">Technicien</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <div className="input-wrapper">
                            <span className="input-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a0aec0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="4" width="20" height="16" rx="2" />
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                            </span>
                            <input
                                id="email"
                                type="email"
                                placeholder="votre.email@univ.fr"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="form-input"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Mot de passe</label>
                        <div className="input-wrapper">
                            <span className="input-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a0aec0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </span>
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-input"
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className={`submit-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
                        {isLoading ? <span className="spinner"></span> : 'Se connecter'}
                    </button>

                    <div style={{marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#718096'}}>
                        Pas encore de compte ? <Link to="/signin" style={{color: '#4299e1', textDecoration: 'none', fontWeight: '600', marginLeft: '5px'}}>S'inscrire</Link>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login
