const express = require('express');
const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const Equipment = require('../models/Equipment');
const { authMiddleware, adminMiddleware } = require('../authMiddleware');

const router = express.Router();

router.patch('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'refused'].includes(status)) {
      return res.status(400).json({ success: false, message: "Statut invalide. Utilisez 'approved' ou 'refused'." });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "ID de réservation invalide." });
    }
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: "Réservation non trouvée." });
    }
    if (reservation.status !== 'pending') {
      return res.status(400).json({ success: false, message: "Seules les réservations en attente peuvent être modifiées." });
    }
    if (status === 'approved') {
      const equipment = await Equipment.findById(reservation.equipmentId);
      if (!equipment) {
        return res.status(404).json({ success: false, message: "Équipement associé non trouvé." });
      }
      if (equipment.quantity < 1) {
        return res.status(400).json({ success: false, message: "Stock insuffisant pour approuver." });
      }
      equipment.quantity -= 1;
      await equipment.save();
    }
    reservation.status = status;
    await reservation.save();
    res.status(200).json({
      success: true,
      message: status === 'approved' ? 'Réservation approuvée avec succès.' : 'Réservation refusée avec succès.',
      data: reservation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur.", error: error.message });
  }
});

router.get('/student/:studentId', authMiddleware, async (req, res) => {
  try {
    const { studentId } = req.params;
    if (req.user.role === 'Student' && req.user.id !== studentId) {
      return res.status(403).json({ success: false, message: "Accès refusé." });
    }
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: "ID étudiant invalide." });
    }
    const reservations = await Reservation.find({ userId: studentId })
      .populate('equipmentId', 'name category emoji imageUrl')
      .sort({ createdAt: -1 });
    const data = reservations.map(r => ({
      _id: r._id,
      equipmentName: r.equipmentId ? r.equipmentId.name : 'Équipement supprimé',
      equipmentCategory: r.equipmentId ? r.equipmentId.category : '',
      equipmentEmoji: r.equipmentId ? r.equipmentId.emoji : '📦',
      startDate: r.startDate,
      endDate: r.endDate,
      status: r.status,
      createdAt: r.createdAt
    }));
    res.status(200).json({ success: true, message: "Réservations récupérées avec succès.", data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur.", error: error.message });
  }
});

router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('userId', 'name email')
      .populate('equipmentId', 'name category emoji')
      .sort({ createdAt: -1 });
    const data = reservations.map(r => ({
      _id: r._id,
      studentName: r.userId ? r.userId.name : 'Utilisateur supprimé',
      studentEmail: r.userId ? r.userId.email : '',
      studentId: r.userId ? r.userId._id : null,
      equipmentName: r.equipmentId ? r.equipmentId.name : 'Équipement supprimé',
      equipmentCategory: r.equipmentId ? r.equipmentId.category : '',
      startDate: r.startDate,
      endDate: r.endDate,
      status: r.status,
      createdAt: r.createdAt
    }));
    res.status(200).json({ success: true, message: "Toutes les réservations récupérées avec succès.", data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur.", error: error.message });
  }
});

module.exports = router;