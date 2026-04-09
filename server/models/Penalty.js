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
    required: true,
    unique: true
  },
  daysLate: {
    type: Number,
    required: true,
    min: 0
  },
  penaltyAmount: {
    type: Number,
    default: 0,
    min: 0
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
