const express = require('express');
const mongoose = require('mongoose');
const MaintenanceTicket = require('../models/MaintenanceTicket');
const Equipment = require('../models/Equipment');
const { authMiddleware } = require('../authMiddleware');

const router = express.Router();

function isAdmin(role) {
  return role === 'Admin';
}

function isTechnician(role) {
  return role === 'Technician';
}

function canAccessMaintenance(role) {
  return isAdmin(role) || isTechnician(role);
}

router.get('/', authMiddleware, async (req, res) => {
  try {
    if (!canAccessMaintenance(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Acces refuse.' });
    }

    const status = req.query.status;
    const query = {};
    if (status === 'open' || status === 'completed') {
      query.status = status;
    }

    const tickets = await MaintenanceTicket.find(query)
      .populate('equipmentId', 'name category serialNumber imageUrl emoji quantity condition status isDeleted')
      .populate('reportedBy', 'username email role')
      .populate('completedBy', 'username email role')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la recuperation des maintenances',
      error: error.message
    });
  }
});

router.get('/summary/open', authMiddleware, async (req, res) => {
  try {
    if (!canAccessMaintenance(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Acces refuse.' });
    }

    const summary = await MaintenanceTicket.aggregate([
      { $match: { status: 'open' } },
      {
        $group: {
          _id: '$equipmentId',
          quantityInMaintenance: { $sum: '$quantity' }
        }
      }
    ]);

    return res.status(200).json({ success: true, data: summary });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la recuperation du resume maintenance',
      error: error.message
    });
  }
});

router.post('/report', authMiddleware, async (req, res) => {
  try {
    if (!isAdmin(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Acces refuse. Admin uniquement.' });
    }

    const { equipmentId, quantity, issue } = req.body || {};

    if (!equipmentId || !quantity || !issue) {
      return res.status(400).json({
        success: false,
        message: 'equipmentId, quantity et issue sont requis.'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(equipmentId)) {
      return res.status(400).json({ success: false, message: 'ID equipement invalide.' });
    }

    const quantityNumber = Number(quantity);
    if (!Number.isFinite(quantityNumber) || quantityNumber <= 0) {
      return res.status(400).json({ success: false, message: 'La quantite doit etre superieure a 0.' });
    }

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment || equipment.isDeleted) {
      return res.status(404).json({ success: false, message: 'Equipement non trouve.' });
    }

    if (equipment.quantity < quantityNumber) {
      return res.status(400).json({
        success: false,
        message: `Quantite disponible insuffisante. Disponible: ${equipment.quantity}.`
      });
    }

    equipment.quantity -= quantityNumber;
    equipment.status = equipment.quantity > 0 ? 'Available' : 'Out of Stock';
    await equipment.save();

    const ticket = await MaintenanceTicket.create({
      equipmentId,
      quantity: quantityNumber,
      issue: String(issue).trim(),
      reportedBy: req.user.id,
      status: 'open'
    });

    const populated = await MaintenanceTicket.findById(ticket._id)
      .populate('equipmentId', 'name category serialNumber imageUrl emoji quantity condition status isDeleted')
      .populate('reportedBy', 'username email role')
      .populate('completedBy', 'username email role');

    return res.status(201).json({
      success: true,
      message: 'Panne signalee avec succes.',
      data: populated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors du signalement de la panne',
      error: error.message
    });
  }
});

router.patch('/:id/complete', authMiddleware, async (req, res) => {
  try {
    if (!isTechnician(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Acces refuse. Technicien uniquement.' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'ID maintenance invalide.' });
    }

    const ticket = await MaintenanceTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket de maintenance non trouve.' });
    }

    if (ticket.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Ce ticket est deja termine.' });
    }

    const equipment = await Equipment.findById(ticket.equipmentId);
    if (!equipment || equipment.isDeleted) {
      return res.status(404).json({ success: false, message: 'Equipement non trouve.' });
    }

    equipment.quantity += ticket.quantity;
    equipment.status = equipment.quantity > 0 ? 'Available' : 'Out of Stock';
    if (equipment.condition === 'Under Maintenance' || equipment.condition === 'Poor') {
      equipment.condition = 'Good';
    }
    await equipment.save();

    ticket.status = 'completed';
    ticket.completedAt = new Date();
    ticket.completedBy = req.user.id;
    await ticket.save();

    const populated = await MaintenanceTicket.findById(ticket._id)
      .populate('equipmentId', 'name category serialNumber imageUrl emoji quantity condition status isDeleted')
      .populate('reportedBy', 'username email role')
      .populate('completedBy', 'username email role');

    return res.status(200).json({
      success: true,
      message: 'Maintenance marquee terminee et stock fusionne.',
      data: populated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la finalisation de la maintenance',
      error: error.message
    });
  }
});

module.exports = router;
