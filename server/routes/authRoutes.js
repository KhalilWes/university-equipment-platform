const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const { authMiddleware, adminMiddleware } = require('../authMiddleware');

const router = express.Router();

/**
 * POST /auth/login
 * Permet à un utilisateur de se connecter et reçoit un JWT
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier que email et password sont fournis
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe sont requis.'
      });
    }

    // Vérifier si l'utilisateur existe via l'email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect.'
      });
    }

    // Utilisation de la méthode comparePassword définie dans le modèle User
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect.'
      });
    }

    // Générer le JWT contenant l'ID et le Rôle avec 24h d'expiration
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '24h'
      }
    );

    // Répondre avec le token et les infos de l'utilisateur
    return res.status(200).json({
      success: true,
      message: 'Connexion réussie.',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la connexion.'
    });
  }
});

/**
 * GET /auth/me
 * Route de test pour vérifier la validité du token JWT
 * Requiert le middleware d'authentification
 */
router.get('/me', authMiddleware, (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Accès autorisé',
    user: {
      id: req.user.id,
      role: req.user.role
    }
  });
});

/**
 * GET /auth/admin-only
 * Route de test réservée aux administrateurs
 */
router.get('/admin-only', authMiddleware, adminMiddleware, (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Accès administrateur accordé.',
    user: {
      id: req.user.id,
      role: req.user.role
    }
  });
});

/**
 * POST /auth/register
 * Permet à un nouvel utilisateur de s'inscrire
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Vérifier que tous les champs requis sont fournis
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email et mot de passe sont requis.'
      });
    }

    // Vérifier si l'email existe déjà dans la base
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Cet email est déjà utilisé.'
      });
    }

    // Créer le nouvel utilisateur. Le hachage sera fait par le middleware pre('save') du modèle.
    const newUser = new User({
      username,
      email,
      password,
      role: role || 'Student' // Par défaut, le rôle est 'Student'
    });

    await newUser.save();

    // Renvoyer un message de succès avec le code 201
    return res.status(201).json({
      success: true,
      message: 'Utilisateur créé',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'inscription.'
    });
  }
});

module.exports = router;
