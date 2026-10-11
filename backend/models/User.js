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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
