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
app.post('/api/spots', upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, location, pricePerHour, maxCapacity } = req.body;
    
    // upload.single('image') provides req.file.path which contains the Cloudinary URL
    const imageUrl = req.file ? req.file.path : 'https://images.unsplash.com/photo-1542751371-adc38448a05e'; // default

    const newSpot = new Spot({
      title,
      description,
      category,
      location,
      pricePerHour: Number(pricePerHour),
      maxCapacity: Number(maxCapacity),
      imageUrl
    });

    const createdSpot = await newSpot.save();
    res.status(201).json(createdSpot);

  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création du spot', error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
