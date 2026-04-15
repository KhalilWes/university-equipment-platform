const mongoose = require('mongoose');

const maintenanceTicketSchema = new mongoose.Schema(
  {
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    issue: {
      type: String,
      required: true,
      trim: true
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['open', 'completed'],
      default: 'open'
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('MaintenanceTicket', maintenanceTicketSchema);
