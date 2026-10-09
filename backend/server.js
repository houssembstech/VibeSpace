require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { upload } = require('./config/cloudinary');
const Spot = require('./models/Spot');

const app = express();

// Middleware
app.use(cors()); // Allow frontend communication (Vercel)
app.use(express.json()); // Parse JSON requests

// Connect to MongoDB Atlas
connectDB();

// Test Route
app.get('/', (req, res) => {
  res.send('API VibeSpace is running...');
});

// GET all Spots
app.get('/api/spots', async (req, res) => {
  try {
    const spots = await Spot.find({});
    res.json(spots);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// POST new Spot with Cloudinary Image Upload
app.post('/api/spots', upload.array('images', 3), async (req, res) => {
  try {
    const { title, description, category, location, pricePerHour, maxCapacity, includedGuests, extraGuestPrice, idealFor, addons, allowedAudiences, animalFee } = req.body;
    
    const images = req.files ? req.files.map(file => file.path) : [];
    const imageUrl = images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1542751371-adc38448a05e';

    const newSpot = new Spot({
      title,
      description,
      category,
      location,
      pricePerHour: Number(pricePerHour),
      maxCapacity: Number(maxCapacity),
      includedGuests: Number(includedGuests || 1),
      extraGuestPrice: Number(extraGuestPrice || 0),
      animalFee: Number(animalFee || 13),
      idealFor: idealFor ? JSON.parse(idealFor) : [],
      addons: addons ? JSON.parse(addons) : [],
      allowedAudiences: allowedAudiences ? JSON.parse(allowedAudiences) : [],
      imageUrl,
      images
    });

    const createdSpot = await newSpot.save();
    res.status(201).json(createdSpot);

  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création du spot', error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
