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
  returnedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound index to speed up availability overlap checks.
reservationSchema.index({ equipmentId: 1, startDate: 1, endDate: 1 });

// Ensure endDate is not before startDate
reservationSchema.pre('validate', function () {
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    throw new Error('La date de fin doit être égale ou postérieure à la date de début');
  }
});

module.exports = mongoose.model('Reservation', reservationSchema);
