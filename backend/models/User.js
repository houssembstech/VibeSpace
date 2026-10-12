const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom est obligatoire']
  },
  spaceName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: [true, "L'email est obligatoire"],
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Le numéro de téléphone est obligatoire']
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est obligatoire']
  },
  role: {
    type: String,
    enum: ['admin', 'responsable'],
    default: 'responsable'
  },
  canEdit: {
    type: Boolean,
    default: false
  },
  pack: {
    type: String,
    enum: ['pack_1', 'pack_2'],
    default: 'pack_1'
  },
  packPrice: {
    type: Number,
    default: 70
  },
  packPurchasedAt: {
    type: Date,
    default: Date.now
  },
  packExpiresAt: {
    type: Date
  },
  packGraceEndsAt: {
    type: Date
  },
  renewalRequest: {
    status: {
      type: String,
      enum: ['none', 'pending', 'approved', 'rejected'],
      default: 'none'
    },
    requestedPack: {
      type: String,
      enum: ['pack_1', 'pack_2'],
      default: 'pack_1'
    },
    requestedPackPrice: {
      type: Number,
      default: 70
    },
    requestedAt: {
      type: Date
    },
    paymentMethod: {
      type: String,
      default: 'Virement / Espèces'
    },
    note: {
      type: String,
      default: ''
    },
    decidedAt: {
      type: Date
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
