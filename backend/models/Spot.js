const mongoose = require('mongoose');

const spotSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est obligatoire']
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['✨ Célébrer', '🌿 Se détendre', '📸 Shooting', '🎬 Regarder', '🎮 Jouer', '⛺ Camping']
  },
  location: {
    type: String,
    required: true
  },
  pricePerHour: {
    type: Number,
    required: true
  },
  priceHalfDay: {
    type: Number,
    default: 0
  },
  priceFullDay: {
    type: Number,
    default: 0
  },
  maxCapacity: {
    type: Number,
    default: 10
  },
  isUnlimitedCapacity: {
    type: Boolean,
    default: false
  },
  includedGuests: {
    type: Number,
    default: 10
  },
  imageUrl: {
    type: String,
    required: false
  },
  images: [{ type: String }],
  extraGuestPrice: { type: Number, default: 0 },
  idealFor: [{ type: String }],
  addons: [{
    id: String,
    name: String,
    price: Number
  }],
  allowedAudiences: [{ type: String }],
  animalFee: { type: Number, default: 13 },
  hostEmail: { type: String },
  hostPhone: { type: String },
  hostWhatsapp: { type: String },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  hostUserId: { type: String },
  rating: {
    type: Number,
    default: 5.0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Spot', spotSchema);
