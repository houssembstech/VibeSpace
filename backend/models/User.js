const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom est obligatoire']
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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
