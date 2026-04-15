const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom de l\'équipement est requis'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'La catégorie est requise'],
    enum: [
      'computers',
      'projectors',
      'electronics',
      'informatique',
      'other',
      'laboratoire',
      'ordinateurs',
      'projecteur',
      'projecteurs',
      'electronique',
      'électronique',
      'autre'
    ],
    lowercase: true
  },
  serialNumber: {
    type: String,
    required: [true, 'Le numéro de série est requis'],
    unique: true,
    trim: true
  },
  condition: {
    type: String,
    required: [true, 'L\'état de l\'équipement est requis'],
    enum: ['New', 'Good', 'Fair', 'Poor', 'Under Maintenance'],
    default: 'Good'
  },
  status: {
    type: String,
    enum: ['Available', 'Out of Stock', 'Maintenance', 'Disponible', 'Rupture de stock', 'En maintenance'],
    default: 'Available'
  },
  quantity: {
    type: Number,
    required: [true, 'La quantité est requise'],
    min: [0, 'La quantité ne peut pas être négative'],
    default: 1
  },
  description: {
    type: String,
    trim: true
  },
  emoji: {
    type: String,
    default: '📦'
  },
  imageUrl: {
    type: String,
    default: ''
  },
  cloudinaryId: {
    type: String,
    default: ''
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  interventionLogs: [
    {
      technicianId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      note: {
        type: String,
        trim: true,
        default: ''
      },
      statusBefore: {
        type: String,
        required: true
      },
      statusAfter: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware pour mettre à jour automatiquement le statut si la quantité atteint 0
equipmentSchema.pre('save', function() {
  const statusText = (this.status || '').toString().toLowerCase();
  const conditionText = (this.condition || '').toString();
  const isMaintenance = statusText.includes('maint') || conditionText === 'Under Maintenance';

  // Canonicalize maintenance states so all UIs can rely on one status value.
  if (isMaintenance) {
    this.status = 'Maintenance';
    return;
  }

  this.status = this.quantity > 0 ? 'Available' : 'Out of Stock';
});

equipmentSchema.methods.checkAvailability = function() {
  if (this.status === 'Maintenance') {
    return {
      available: false,
      reason: 'Cet équipement est en maintenance'
    };
  }

  if (this.quantity <= 0) {
    return {
      available: false,
      reason: 'Cet équipement est en rupture de stock'
    };
  }

  return { available: true };
};

module.exports = mongoose.model('Equipment', equipmentSchema);