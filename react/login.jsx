import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { mockUsers } from '../data/mockData';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulation d'un délai réseau (1 seconde)
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = mockUsers.find(u => u.email === email);
    
    if (user && password === '123456') {
      // Sauvegarder l'utilisateur dans le localStorage
      localStorage.setItem('user', JSON.stringify(user));
      
      // Redirection selon le rôle
      const rolePath = {
        STUDENT: '/student',
        ADMIN: '/admin',
        TECH: '/tech',
      };
      
      navigate(rolePath[user.role] || '/');
    } else {
      setError('Email ou mot de passe incorrect');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        {/* Logo / Titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <span className="text-3xl">🎓</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Gestion Matériel</h1>
          <p className="text-gray-600 mt-2">Portail de réservation universitaire</p>
        </div>

        {/* Carte de Connexion */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Connexion</h2>
          
          <form onSubmit={handleLogin}>
            <Input 
              label="Email" 
              type="email" 
              placeholder="exemple@etu.univ.fr" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error && !email ? 'Email requis' : ''}
            />
            
            <Input 
              label="Mot de passe" 
              type="password" 
              placeholder="••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error && !password ? 'Mot de passe requis' : ''}
            />
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </form>

          {/* Informations de test */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center mb-3">
              📌 Comptes de test (mot de passe : <strong>123456</strong>)
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                <span>👨‍🎓 Étudiant</span>
                <code className="text-primary">jean@etu.univ.fr</code>
              </div>
              <div className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                <span>👨‍💼 Admin</span>
                <code className="text-primary">admin@univ.fr</code>
              </div>
              <div className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                <span>🔧 Technicien</span>
                <code className="text-primary">tech@univ.fr</code>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          © 2024 Université - Tous droits réservés
        </p>
      </div>
    </div>
  );
}