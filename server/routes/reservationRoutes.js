const express = require('express');
const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const Equipment = require('../models/Equipment');
const { authMiddleware } = require('../authMiddleware');

const router = express.Router();

/** Helper: only Admin and Technician can manage reservations */
function canManageReservations(role) {
  return role === 'Admin' || role === 'Technician';
}

/**
 * Normalize a populated reservation document into a flat DTO
 * so the frontend always gets consistent field names.
 */
function normalizeReservation(item) {
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

/**
 * GET /api/reservations
 * Students see only their own; Admins/Technicians see all.
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const query = req.user.role === 'Student' ? { userId: req.user.id } : {};
    const reservations = await Reservation.find(query)
      .populate('userId', 'username email role')
      .populate('equipmentId', 'name status quantity')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations.map(normalizeReservation)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des réservations',
      error: error.message
    });
  }
});

/**
 * POST /api/reservations
 * Creates a new reservation for the authenticated user.
 */
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

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Format de date invalide'
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'La date de fin doit être égale ou postérieure à la date de début'
      });
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

    // Check if the specific user has already reserved this exact equipment for overlapping dates
    const userOverlappingReservation = await Reservation.findOne({
      userId: req.user.id,
      equipmentId: equipmentId,
      status: { $nin: ['refused', 'returned', 'cancelled'] },
      startDate: { $lt: end },
      endDate: { $gt: start }
    });

    if (userOverlappingReservation) {
      return res.status(409).json({
        success: false,
        message: 'Vous avez déjà réservé cet équipement pour ces dates'
      });
    }

    // Check if there are enough copies for another reservation request.
    // Approved reservations have ALREADY reduced equipment.quantity.
    // So we just check if pending requests equal or exceed the currently available quantity.
    const pendingRequestsCount = await Reservation.countDocuments({
      equipmentId: equipmentId,
      status: 'pending',
      startDate: { $lt: end },
      endDate: { $gt: start }
    });

    if (pendingRequestsCount >= equipment.quantity) {
      return res.status(409).json({
        success: false,
        message: 'Toutes les copies disponibles de cet équipement sont déjà réservées ou en cours de validation pour ces dates'
      });
    }

    const reservation = await Reservation.create({
      userId: req.user.id,
      equipmentId,
      startDate: start,
      endDate: end,
      status: 'pending'
    });

    const populated = await Reservation.findById(reservation._id)
      .populate('userId', 'username email role')
      .populate('equipmentId', 'name status quantity');

    return res.status(201).json({
      success: true,
      message: 'Réservation créée avec succès',
      data: normalizeReservation(populated)
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Erreur lors de la création de la réservation',
      error: error.message
    });
  }
});

/**
 * PATCH /api/reservations/:id/status
 * Updates reservation status (approved / refused / returned).
 * Admin & Technician only.
 */
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
        message: `Statut invalide. Valeurs autorisées: ${allowed.join(', ')}`
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
        return res.status(400).json({
          success: false,
          message: availability.reason || 'Équipement indisponible'
        });
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

      // Check if returned late
      const end = new Date(reservation.endDate);
      const returned = reservation.returnedAt;

      // Reset hours to compare purely by calendar day if desired, or leave precise
      // We'll calculate the difference in days
      if (returned > end) {
        const diffTime = Math.abs(returned - end);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
          // Check if penalty already exists to prevent duplicates
          const Penalty = require('../models/Penalty');
          const existing = await Penalty.findOne({ reservationId: reservation._id });

          if (!existing) {
            // Assume penalty is 10 DT per day late for example
            const penaltyAmount = diffDays * 10;

            await Penalty.create({
              userId: reservation.userId,
              reservationId: reservation._id,
              daysLate: diffDays,
              penaltyAmount: penaltyAmount,
              status: 'unpaid'
            });
          }
        }
      }
    }

    reservation.status = status;
    await Promise.all([equipment.save(), reservation.save()]);

    const updated = await Reservation.findById(reservation._id)
      .populate('userId', 'username email role')
      .populate('equipmentId', 'name status quantity');

    return res.status(200).json({
      success: true,
      message: 'Statut de réservation mis à jour',
      data: normalizeReservation(updated)
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut de réservation',
      error: error.message
    });
  }
});

/**
 * GET /api/reservations/check-availability/:equipmentId
 * Checks real-time availability of an equipment item.
 */
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