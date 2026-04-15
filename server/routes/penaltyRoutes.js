const express = require('express');
const Penalty = require('../models/Penalty');
const Reservation = require('../models/Reservation');
const User = require('../models/User');
const { authMiddleware } = require('../authMiddleware');
const { checkOverdueReservations } = require('../jobs/checkOverdueReservations');

const router = express.Router();

function canManagePenalties(role) {
  return role === 'Admin' || role === 'Technician';
}

router.post('/', authMiddleware, async (req, res) => {
  try {
    if (!canManagePenalties(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const { userId, penaltyAmount, type, description, daysLate, reservationId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'Étudiant requis' });
    }

    const amount = Number(penaltyAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Montant invalide' });
    }

    const student = await User.findById(userId).select('_id role');
    if (!student || student.role !== 'Student') {
      return res.status(404).json({ success: false, message: 'Étudiant introuvable' });
    }

    let linkedReservationId;
    if (reservationId) {
      const reservation = await Reservation.findById(reservationId).select('_id userId');
      if (!reservation) {
        return res.status(404).json({ success: false, message: 'Réservation introuvable' });
      }

      if (String(reservation.userId) !== String(userId)) {
        return res.status(400).json({ success: false, message: 'La réservation ne correspond pas à cet étudiant' });
      }

      const exists = await Penalty.exists({ reservationId: reservation._id });
      if (exists) {
        return res.status(409).json({ success: false, message: 'Une pénalité existe déjà pour cette réservation' });
      }

      linkedReservationId = reservation._id;
    }

    const penalty = await Penalty.create({
      userId,
      reservationId: linkedReservationId,
      daysLate: Math.max(0, Number(daysLate || 0)),
      type: ['retard', 'casse', 'autre'].includes(type) ? type : 'autre',
      description: (description || '').toString().trim(),
      penaltyAmount: amount,
      status: 'unpaid',
      source: 'manual',
      createdBy: req.user.id
    });

    const populatedPenalty = await Penalty.findById(penalty._id)
      .populate('userId', 'username email role')
      .populate('reservationId', 'startDate endDate status');

    return res.status(201).json({
      success: true,
      message: 'Pénalité ajoutée avec succès',
      data: populatedPenalty
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Erreur lors de la création de la pénalité',
      error: error.message
    });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const query = req.user.role === 'Student' ? { userId: req.user.id } : {};
    const penalties = await Penalty.find(query)
      .populate('userId', 'username email role')
      .populate('reservationId', 'startDate endDate status')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: penalties.length,
      data: penalties
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des pénalités',
      error: error.message
    });
  }
});

router.patch('/:id/mark-paid', authMiddleware, async (req, res) => {
  try {
    if (!canManagePenalties(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const penalty = await Penalty.findById(req.params.id);
    if (!penalty) {
      return res.status(404).json({ success: false, message: 'Pénalité introuvable' });
    }

    penalty.status = 'paid';
    penalty.markedPaidAt = new Date();
    await penalty.save();

    return res.status(200).json({
      success: true,
      message: 'Pénalité marquée comme payée',
      data: penalty
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la pénalité',
      error: error.message
    });
  }
});

router.post('/check-overdue', authMiddleware, async (req, res) => {
  try {
    if (!canManagePenalties(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const summary = await checkOverdueReservations({
      penaltyPerDay: req.body?.penaltyPerDay
    });

    return res.status(200).json({
      success: true,
      message: 'Vérification des retards terminée',
      data: summary
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification des retards',
      error: error.message
    });
  }
});

router.get('/reservation/:reservationId', authMiddleware, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.reservationId);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Réservation introuvable' });
    }

    const penalty = await Penalty.findOne({ reservationId: req.params.reservationId });
    if (!penalty) {
      return res.status(404).json({ success: false, message: 'Aucune pénalité pour cette réservation' });
    }

    return res.status(200).json({ success: true, data: penalty });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Erreur lors de la récupération de la pénalité',
      error: error.message
    });
  }
});

module.exports = router;
