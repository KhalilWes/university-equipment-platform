const express = require('express');
const mongoose = require('mongoose');
const Equipment = require('../models/Equipment');
const { authMiddleware } = require('../authMiddleware');
const { upload, cloudinary } = require('../config/cloudinary');

const router = express.Router();

/**
 * GET /api/equipment
 * Récupère la liste complète des équipements pour le catalogue.
 * Accessible par : Student, Technician, Admin.
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const items = await Equipment.find({ isDeleted: { $ne: true } }).sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des équipements",
      error: error.message
    });
  }
});

/**
 * GET /api/equipment/trash
 * Récupère uniquement les équipements archivés (isDeleted: true).
 */
router.get('/trash', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'Student') {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }
    const items = await Equipment.find({ isDeleted: true }).sort({ deletedAt: -1 });
    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur lors de la récupération de la corbeille", error: error.message });
  }
});

/**
 * PUT /api/equipment/restore/:id
 * Restaure un équipement supprimé.
 */
router.put('/restore/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'Student') {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    const restoredEquipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false, deletedAt: null },
      { new: true }
    );

    if (!restoredEquipment) {
      return res.status(404).json({ success: false, message: "Équipement non trouvé" });
    }

    res.status(200).json({
      success: true,
      message: "Équipement restauré avec succès",
      data: restoredEquipment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Erreur lors de la restauration",
      error: error.message
    });
  }
});

/**
 * POST /api/equipment
 * Ajoute un nouvel équipement à l'inventaire.
 * Accessible par : Technician, Admin (via authMiddleware).
 */
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    // On vérifie si l'utilisateur a les droits suffisants (Tech ou Admin)
    if (req.user.role === 'Student') {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    const equipmentData = { ...req.body };

    // Si un fichier a été uploadé, on récupère les infos de Cloudinary
    if (req.file) {
      equipmentData.imageUrl = req.file.path;
      equipmentData.cloudinaryId = req.file.filename;
    }

    // Assurer que la quantité est un nombre
    if (equipmentData.quantity) {
      equipmentData.quantity = Number(equipmentData.quantity);
    }

    const newEquipment = new Equipment(equipmentData); 
    await newEquipment.save();
    res.status(201).json({
      success: true,
      message: "Équipement ajouté avec succès",
      data: newEquipment
    });
  } catch (error) {
    console.error("Erreur Backend POST:", error); // Log l'erreur complète sur le serveur
    let errorMessage = "Erreur lors de l'ajout de l'équipement";
    if (error.code === 11000) {
      errorMessage = "Un équipement avec ce numéro de série existe déjà.";
    } else if (error.name === 'ValidationError') {
      // Mongoose validation error
      errorMessage = Object.values(error.errors).map(err => err.message).join(', ');
    }

    res.status(400).json({
      success: false,
      message: errorMessage,
      error: error.message
    });
  }
});

/**
 * PUT /api/equipment/:id
 * Met à jour un équipement existant.
 * Accessible par : Technician, Admin.
 */
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    // On vérifie si l'utilisateur a les droits suffisants (Tech ou Admin)
    if (req.user.role === 'Student') {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    // Vérification de la validité de l'ID pour éviter un crash CastError
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "ID d'équipement invalide" });
    }

    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ success: false, message: "Équipement non trouvé" });
    }

    // Mise à jour manuelle des champs pour garantir le casting et la validation
    const fieldsToUpdate = ['name', 'category', 'serialNumber', 'condition', 'quantity', 'description', 'emoji'];
    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== "") {
        // Conversion explicite pour la quantité
        if (field === 'quantity') {
          equipment[field] = Number(req.body[field]);
          return;
        }
        equipment[field] = req.body[field];
      }
    });

    // Si une nouvelle image est téléchargée
    if (req.file) {
      // Supprimer l'ancienne image de Cloudinary si elle existe
      if (equipment.cloudinaryId) {
        await cloudinary.uploader.destroy(equipment.cloudinaryId);
      }
      
      // Ajouter les nouvelles infos d'image
      equipment.imageUrl = req.file.path;
      equipment.cloudinaryId = req.file.filename;
    }

    // Utilisation de .save() au lieu de findByIdAndUpdate pour déclencher le middleware pre('save')
    await equipment.save();

    res.status(200).json({
      success: true,
      message: "Équipement mis à jour avec succès",
      data: equipment
    });
  } catch (error) {
    console.error("Erreur Backend PUT:", error);
    res.status(400).json({
      success: false,
      message: error.code === 11000 ? "Ce numéro de série existe déjà." : "Erreur lors de la mise à jour de l'équipement",
      error: error.message
    });
  }
});

/**
 * PUT /api/equipment/:id/status
 * Met à jour le statut maintenance/disponible.
 * Accessible par : Technician uniquement.
 */
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'Technician') {
      return res.status(403).json({ success: false, message: 'Accès refusé. Technician uniquement.' });
    }

    const { status } = req.body;
    const allowedStatuses = ['Available', 'Maintenance'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Statut invalide. Utilisez: ${allowedStatuses.join(', ')}`
      });
    }

    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Équipement non trouvé' });
    }

    equipment.status = status;
    await equipment.save();

    return res.status(200).json({
      success: true,
      message: 'Statut mis à jour avec succès',
      data: equipment
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut',
      error: error.message
    });
  }
});

/**
 * POST /api/equipment/:id/interventions
 * Ajoute une intervention de maintenance et peut mettre à jour le statut.
 * Accessible par : Technician, Admin.
 */
router.post('/:id/interventions', authMiddleware, async (req, res) => {
  try {
    if (!['Technician', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Technician/Admin uniquement.'
      });
    }

    if (!req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "ID d'équipement invalide"
      });
    }

    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Équipement non trouvé'
      });
    }

    const { note = '', statusAfter } = req.body || {};
    const noteValue = typeof note === 'string' ? note.trim() : '';

    if (!noteValue) {
      return res.status(400).json({
        success: false,
        message: 'Le champ note est requis'
      });
    }

    const allowedStatuses = Equipment.schema.path('status')?.enumValues || [];
    if (statusAfter !== undefined && !allowedStatuses.includes(statusAfter)) {
      return res.status(400).json({
        success: false,
        message: `Statut invalide. Utilisez: ${allowedStatuses.join(', ')}`
      });
    }

    const statusBefore = equipment.status;
    const nextStatus = statusAfter !== undefined ? statusAfter : statusBefore;

    equipment.status = nextStatus;

    equipment.interventionLogs.push({
      technicianId: req.user.id,
      note: noteValue,
      statusBefore,
      statusAfter: nextStatus
    });

    await equipment.save();

    const addedLog = equipment.interventionLogs[equipment.interventionLogs.length - 1];
    return res.status(201).json({
      success: true,
      message: 'Intervention ajoutée avec succès',
      data: {
        equipment,
        intervention: addedLog
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'ajout de l'intervention",
      error: error.message
    });
  }
});

/**
 * GET /api/equipment/:id/interventions
 * Retourne l'historique des interventions (trié du plus récent au plus ancien).
 * Accessible par : utilisateur authentifié.
 */
router.get('/:id/interventions', authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "ID d'équipement invalide"
      });
    }

    const equipment = await Equipment.findById(req.params.id)
      .populate('interventionLogs.technicianId', 'username email role');

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Équipement non trouvé'
      });
    }

    const interventions = [...(equipment.interventionLogs || [])].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return res.status(200).json({
      success: true,
      message: 'Historique des interventions récupéré avec succès',
      data: interventions
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des interventions",
      error: error.message
    });
  }
});

/**
 * DELETE /api/equipment/empty-trash
 * Supprime définitivement TOUS les équipements marqués comme supprimés.
 */
router.delete('/empty-trash', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'Student') {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    // 1. Trouver tous les équipements dans la corbeille
    const archivedItems = await Equipment.find({ isDeleted: true });

    // 2. Supprimer les images correspondantes sur Cloudinary
    const deletePromises = archivedItems
      .filter(item => item.cloudinaryId) // On ne garde que ceux qui ont une image
      .map(item => {
        console.log(`☁️ Nettoyage Cloudinary pour: ${item.cloudinaryId}`);
        return cloudinary.uploader.destroy(item.cloudinaryId);
      });

    await Promise.all(deletePromises);

    // 3. Supprimer les documents de la base de données
    await Equipment.deleteMany({ isDeleted: true });

    res.status(200).json({ success: true, message: "La corbeille a été vidée avec succès" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur lors du vidage de la corbeille", error: error.message });
  }
});

/**
 * DELETE /api/equipment/permanent/:id
 * Supprime définitivement UN équipement de la base de données.
 */
router.delete('/permanent/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'Student') {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ success: false, message: "Équipement non trouvé" });
    }

    // Suppression de l'image sur Cloudinary si elle existe
    if (equipment.cloudinaryId) {
      console.log(`☁️ Tentative de suppression de l'image Cloudinary: ${equipment.cloudinaryId}`);
      const cloudRes = await cloudinary.uploader.destroy(equipment.cloudinaryId);
      console.log("Resultat Cloudinary:", cloudRes);
    }

    await Equipment.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Équipement supprimé physiquement de la base" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur lors de la suppression définitive", error: error.message });
  }
});

/**
 * DELETE /api/equipment/:id
 * Supprime un équipement de l'inventaire.
 * Accessible par : Technician, Admin.
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // On vérifie si l'utilisateur a les droits suffisants (Tech ou Admin)
    if (req.user.role === 'Student') {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    const deletedEquipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!deletedEquipment) {
      return res.status(404).json({ success: false, message: "Équipement non trouvé" });
    }

    res.status(200).json({
      success: true,
      message: "Équipement supprimé avec succès"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de l'équipement",
      error: error.message
    });
  }
});

module.exports = router;