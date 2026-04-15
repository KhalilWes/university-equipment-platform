const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const { authMiddleware, adminMiddleware } = require('../authMiddleware');

const router = express.Router();

function mapUserResponse(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    specialization: user.specialization || ''
  };
}

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
      user: mapUserResponse(user)
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
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Accès autorisé',
      user: mapUserResponse(user)
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du profil.'
    });
  }
});

/**
 * PUT /auth/me
 * Met à jour le profil de l'utilisateur connecté
 */
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, specialization } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé.'
      });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Cet email est déjà utilisé.'
        });
      }
    }

    if (username !== undefined) user.username = username;
    if (email !== undefined) user.email = email;
    if (password && password.trim()) user.password = password;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (specialization !== undefined) user.specialization = specialization;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profil mis à jour avec succès.',
      user: mapUserResponse(user)
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du profil.',
      error: error.message
    });
  }
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
    const { username, email, password, role, firstName, lastName, specialization } = req.body;

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
      firstName: firstName || '',
      lastName: lastName || '',
      specialization: specialization || '',
      role: role || 'Student' // Par défaut, le rôle est 'Student'
    });

    await newUser.save();

    // Renvoyer un message de succès avec le code 201
    return res.status(201).json({
      success: true,
      message: 'Utilisateur créé',
      user: mapUserResponse(newUser)
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'inscription.'
    });
  }
});

/**
 * GET /auth/users
 * Récupère la liste de tous les utilisateurs (Admin uniquement)
 */
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({}).select('-password'); // Exclude password field
    return res.status(200).json({
      success: true,
      message: 'Utilisateurs récupérés avec succès.',
      data: users || [],
      count: users.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des utilisateurs.',
      error: error.message
    });
  }
});

/**
 * PUT /auth/users/:userId
 * Met à jour les informations d'un utilisateur (Admin uniquement)
 */
router.put('/users/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email, password, firstName, lastName, specialization } = req.body;

    // Vérifier que l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé.'
      });
    }

    // Vérifier que l'email n'existe pas déjà pour un autre utilisateur
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Cet email est déjà utilisé.'
        });
      }
    }

    // Mettre à jour les champs fournis
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = password; // Le hachage sera fait par le middleware pre('save')
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (specialization !== undefined) user.specialization = specialization;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Utilisateur mis à jour avec succès.',
      user: mapUserResponse(user)
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour de l\'utilisateur.',
      error: error.message
    });
  }
});

/**
 * DELETE /auth/users/:userId
 * Supprime un utilisateur (Admin uniquement)
 */
router.delete('/users/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    // Vérifier que l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé.'
      });
    }

    // Empêcher la suppression du dernier administrateur (optionnel)
    if (user.role === 'Admin') {
      const adminCount = await User.countDocuments({ role: 'Admin' });
      if (adminCount === 1) {
        return res.status(400).json({
          success: false,
          message: 'Impossible de supprimer le dernier administrateur.'
        });
      }
    }

    // Supprimer l'utilisateur
    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé avec succès.'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de l\'utilisateur.',
      error: error.message
    });
  }
});

module.exports = router;
