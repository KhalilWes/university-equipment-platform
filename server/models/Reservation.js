const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  equipmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: true,
    index: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'refused', 'returned'],
    default: 'pending',
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  returnedAt: {
    type: Date,
    default: null
  }
});

reservationSchema.pre('validate', function(next) {
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    return next(new Error('La date de fin doit être égale ou postérieure à la date de début'));
  }
  return next();
});

module.exports = mongoose.model('Reservation', reservationSchema);
