const mongoose = require('mongoose');

const penaltySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  reservationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation',
    required: false,
    index: true,
    sparse: true
  },
  daysLate: {
    type: Number,
    required: false,
    default: 0,
    min: 0
  },
  type: {
    type: String,
    enum: ['retard', 'casse', 'autre'],
    default: 'retard'
  },
  description: {
    type: String,
    default: ''
  },
  penaltyAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  source: {
    type: String,
    enum: ['auto-overdue', 'manual'],
    default: 'manual'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  status: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  markedPaidAt: {
    type: Date,
    default: null
  }
});
module.exports = mongoose.model('Penalty', penaltySchema);
