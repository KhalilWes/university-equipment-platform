const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Extraire le token du header Authorization
    const authHeader = req.headers.authorization;

    // Vérifier que le header Authorization existe
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token manquant. Veuillez fournir un token dans le header Authorization.'
      });
    }

    // Extraire le token après "Bearer "
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    // Vérifier que le token n'est pas vide
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Format du token invalide. Utilisez: Bearer <token>'
      });
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ajouter les informations de l'utilisateur à req.user
    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    next();
  } catch (error) {
    // Gérer les différentes erreurs JWT
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré.'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Erreur d\'authentification.'
    });
  }
};

module.exports = authMiddleware;
