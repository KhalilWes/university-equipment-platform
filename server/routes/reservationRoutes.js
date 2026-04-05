const express = require('express');
const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const Equipment = require('../models/Equipment');
const { authMiddleware } = require('../authMiddleware');

const router = express.Router();

function canManageReservations(role) {
  return role === 'Admin' || role === 'Technician';
}

function normalizeReservationForAdmin(item) {
  return {
    _id: item._id,
    userId: item.userId?._id || item.userId,
    equipmentId: item.equipmentId?._id || item.equipmentId,
    studentName: item.userId?.username || 'N/A',
    studentId: item.userId?._id ? String(item.userId._id) : 'N/A',
    equipmentName: item.equipmentId?.name || 'N/A',
    startDate: item.startDate,
    endDate: item.endDate,
    status: item.status,
    createdAt: item.createdAt,
    returnedAt: item.returnedAt || null
  };
}

router.get('/', authMiddleware, async (req, res) => {
  try {
    const query = req.user.role === 'Student' ? { userId: req.user.id } : {};

    const reservations = await Reservation.find(query)
      .populate('userId', 'username email role')
      .populate('equipmentId', 'name status quantity')
      .sort({ createdAt: -1 });

    const data = reservations.map(normalizeReservationForAdmin);

    return res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des réservations',
      error: error.message
    });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { equipmentId, startDate, endDate } = req.body;

    if (!equipmentId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'equipmentId, startDate et endDate sont requis'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(equipmentId)) {
      return res.status(400).json({ success: false, message: 'ID équipement invalide' });
    }

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment || equipment.isDeleted) {
      return res.status(404).json({ success: false, message: 'Équipement non trouvé' });
    }

    const availability = equipment.checkAvailability();
    if (!availability.available) {
      return res.status(400).json({
        success: false,
        message: availability.reason || 'Équipement indisponible'
      });
    }

    const reservation = await Reservation.create({
      userId: req.user.id,
      equipmentId,
      startDate,
      endDate,
      status: 'pending'
    });

    const populated = await Reservation.findById(reservation._id)
      .populate('userId', 'username email role')
      .populate('equipmentId', 'name status quantity');

    return res.status(201).json({
      success: true,
      message: 'Réservation créée avec succès',
      data: normalizeReservationForAdmin(populated)
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Erreur lors de la création de la réservation',
      error: error.message
    });
  }
});

router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    if (!canManageReservations(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const { status } = req.body;
    const allowed = ['approved', 'refused', 'returned'];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status invalide. Valeurs autorisées: ${allowed.join(', ')}`
      });
    }

    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Réservation non trouvée' });
    }

    const equipment = await Equipment.findById(reservation.equipmentId);
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Équipement lié introuvable' });
    }

    if (status === 'approved') {
      const availability = equipment.checkAvailability();
      if (!availability.available) {
        return res.status(400).json({ success: false, message: availability.reason || 'Équipement indisponible' });
      }
      if (reservation.status !== 'approved') {
        equipment.quantity = Math.max(0, equipment.quantity - 1);
      }
    }

    if (status === 'returned') {
      if (reservation.status !== 'approved') {
        return res.status(400).json({
          success: false,
          message: 'Seule une réservation approuvée peut être marquée comme retournée'
        });
      }
      equipment.quantity += 1;
      reservation.returnedAt = new Date();
    }

    reservation.status = status;

    await Promise.all([equipment.save(), reservation.save()]);

    const updated = await Reservation.findById(reservation._id)
      .populate('userId', 'username email role')
      .populate('equipmentId', 'name status quantity');

    return res.status(200).json({
      success: true,
      message: 'Statut de réservation mis à jour',
      data: normalizeReservationForAdmin(updated)
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut de réservation',
      error: error.message
    });
  }
});

router.get('/check-availability/:equipmentId', authMiddleware, async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.equipmentId);
    if (!equipment || equipment.isDeleted) {
      return res.status(404).json({ success: false, message: 'Équipement non trouvé' });
    }

    const availability = equipment.checkAvailability();
    return res.status(200).json({ success: true, data: availability });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Erreur pendant la vérification de disponibilité',
      error: error.message
    });
  }
});

module.exports = router;
