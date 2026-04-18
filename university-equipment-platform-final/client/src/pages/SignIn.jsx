import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './SignIn.css'

function SignIn() {
    const navigate = useNavigate()
    const [role, setRole] = useState('')
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const validatePassword = (pwd) => {
        const hasUpperCase = /[A-Z]/.test(pwd)
        const hasLowerCase = /[a-z]/.test(pwd)
        const hasNumbers = /\d/.test(pwd)
        const isLongEnough = pwd.length >= 8
        return hasUpperCase && hasLowerCase && hasNumbers && isLongEnough
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas")
            return
        }

        if (!validatePassword(password)) {
            setError("Le mot de passe doit contenir au moins 8 caractères dont une majuscule, une minuscule et un chiffre")
            return
        }

        setIsLoading(true)
        
        // Mappage du rôle sélectionné vers le nom attendu par le backend
        let mappedRole = 'Student';
        if (role === 'admin') mappedRole = 'Admin';
        if (role === 'technicien') mappedRole = 'Technician';

        try {
            // Etape 1 : Inscription
            const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    role: mappedRole
                })
            });

            const registerData = await registerResponse.json();

            if (!registerResponse.ok) {
                setError(registerData.message || 'Erreur lors de l\'inscription');
                setIsLoading(false);
                return;
            }

            // Etape 2 : Connexion automatique après inscription
            const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const loginData = await loginResponse.json();

            setIsLoading(false);

            if (loginResponse.ok && loginData.token) {
                // Stockage des informations d'authentification
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('token', loginData.token);
                if (loginData.user) {
                    localStorage.setItem('user', JSON.stringify(loginData.user));
                }

                // Redirection basée sur le rôle choisi
                if (role === 'etudiant') {
                    navigate('/Etudiant')
                } else if (role === 'admin') {
                    navigate('/Admin')
                } else if (role === 'technicien') {
                    navigate('/Technicien')
                } else {
                    navigate('/')
                }
            } else {
                setError('Inscription réussie mais connexion automatique échouée. Veuillez vous connecter manuellement.');
                navigate('/');
            }

        } catch {
            setError('Erreur de connexion au serveur backend (vérifier que le serveur sur :5000 est allumé)');
            setIsLoading(false);
        }
    }

    return (
        <div className="page-wrapper">
            <div className="login-card">
                <div className="icon-circle">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white">
                        <path d="M15 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        <circle cx="15" cy="8" r="4" />
                        <path d="M5 11h4v2H5v4H3v-4H-1v-2h4V7h2v4z" />
                    </svg>
                </div>

                <h1 className="title">Créer un compte</h1>
                <p className="subtitle">Inscrivez-vous pour accéder à la plateforme</p>

                {error && (
                    <div className="error-msg">
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
                        <label htmlFor="username">Pseudo (Nom d'utilisateur)</label>
                        <div className="input-wrapper">
                            <span className="input-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a0aec0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </span>
                            <input
                                id="username"
                                type="text"
                                placeholder="votre_pseudo"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="form-input"
                                required
                            />
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

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                        <div className="input-wrapper">
                            <span className="input-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a0aec0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </span>
                            <input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="form-input"
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className={`submit-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
                        {isLoading ? <span className="spinner"></span> : 'S\'inscrire'}
                    </button>

                    <div className="redirect-container">
                        Déjà un compte ? <Link to="/" className="redirect-link">Se connecter</Link>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default SignIn
