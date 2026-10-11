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

// Diagnostic Route
app.get('/api/config-check', (req, res) => {
  res.json({
    hasMongo: !!process.env.MONGO_URI,
    hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
    hasApiKey: !!process.env.CLOUDINARY_API_KEY,
    hasApiSecret: !!process.env.CLOUDINARY_API_SECRET
  });
});

const User = require('./models/User');

// Helper to ensure houssembs.tech@gmail.com is admin
const ensureAdminAccount = async () => {
  try {
    const adminEmail = 'houssembs.tech@gmail.com';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = new User({
        name: 'Houssem (Admin)',
        email: adminEmail,
        phone: '+216 00 000 000',
        password: 'admin',
        role: 'admin',
        canEdit: true
      });
      await admin.save();
      console.log('Default Admin Account initialized for houssembs.tech@gmail.com');
    } else if (admin.role !== 'admin' || !admin.canEdit) {
      admin.role = 'admin';
      admin.canEdit = true;
      await admin.save();
    }
  } catch (err) {
    console.error('Error ensuring admin account:', err.message);
  }
};
ensureAdminAccount();

// GET Spots (filters approved by default for public, or all=true for admin, or by hostEmail)
app.get('/api/spots', async (req, res) => {
  try {
    const { all, hostEmail } = req.query;
    let filter = {};
    if (all === 'true') {
      filter = {};
    } else if (hostEmail) {
      filter = { hostEmail };
    } else {
      // Public view: only approved spots or legacy spots without status
      filter = {
        $or: [
          { status: 'approved' },
          { status: { $exists: false } },
          { status: null }
        ]
      };
    }
    const spots = await Spot.find(filter).sort({ createdAt: -1 });
    res.json(spots);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// POST new Spot with Cloudinary Image Upload
app.post('/api/spots', upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, category, location, pricePerHour, maxCapacity, includedGuests, extraGuestPrice, idealFor, addons, allowedAudiences, animalFee, hostEmail, hostPhone, hostWhatsapp, hostUserId } = req.body;
    
    const images = req.files ? req.files.map(file => file.path) : [];
    const imageUrl = images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1542751371-adc38448a05e';

    // Auto-approve if created by admin, otherwise pending
    const status = (hostEmail && hostEmail.toLowerCase() === 'houssembs.tech@gmail.com') ? 'approved' : 'pending';

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
      idealFor: idealFor ? (typeof idealFor === 'string' ? JSON.parse(idealFor) : idealFor) : [],
      addons: addons ? (typeof addons === 'string' ? JSON.parse(addons) : addons) : [],
      allowedAudiences: allowedAudiences ? (typeof allowedAudiences === 'string' ? JSON.parse(allowedAudiences) : allowedAudiences) : [],
      hostEmail,
      hostPhone,
      hostWhatsapp,
      hostUserId,
      imageUrl,
      images,
      status
    });

    const createdSpot = await newSpot.save();
    res.status(201).json(createdSpot);

  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création du spot', error: error.message });
  }
});

// PATCH Spot Status (Approve / Pending / Reject)
app.patch('/api/spots/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Spot.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Spot introuvable' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Erreur mise à jour statut', error: error.message });
  }
});

// PUT Spot Edit (For authorized manager or admin)
app.put('/api/spots/:id', upload.array('images', 5), async (req, res) => {
  try {
    const spot = await Spot.findById(req.params.id);
    if (!spot) return res.status(404).json({ message: 'Spot introuvable' });

    const { title, description, category, location, pricePerHour, maxCapacity, includedGuests, extraGuestPrice, idealFor, addons, allowedAudiences, animalFee, hostEmail, hostPhone, hostWhatsapp } = req.body;

    if (title) spot.title = title;
    if (description) spot.description = description;
    if (category) spot.category = category;
    if (location) spot.location = location;
    if (pricePerHour !== undefined) spot.pricePerHour = Number(pricePerHour);
    if (maxCapacity !== undefined) spot.maxCapacity = Number(maxCapacity);
    if (includedGuests !== undefined) spot.includedGuests = Number(includedGuests);
    if (extraGuestPrice !== undefined) spot.extraGuestPrice = Number(extraGuestPrice);
    if (animalFee !== undefined) spot.animalFee = Number(animalFee);
    if (hostEmail) spot.hostEmail = hostEmail;
    if (hostPhone) spot.hostPhone = hostPhone;
    if (hostWhatsapp) spot.hostWhatsapp = hostWhatsapp;
    if (idealFor) spot.idealFor = typeof idealFor === 'string' ? JSON.parse(idealFor) : idealFor;
    if (addons) spot.addons = typeof addons === 'string' ? JSON.parse(addons) : addons;
    if (allowedAudiences) spot.allowedAudiences = typeof allowedAudiences === 'string' ? JSON.parse(allowedAudiences) : allowedAudiences;

    if (req.files && req.files.length > 0) {
      spot.images = req.files.map(file => file.path);
      spot.imageUrl = spot.images[0];
    }

    const saved = await spot.save();
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Erreur mise à jour du spot', error: error.message });
  }
});

// DELETE Spot
app.delete('/api/spots/:id', async (req, res) => {
  try {
    const deleted = await Spot.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Spot introuvable' });
    res.json({ message: 'Spot supprimé avec succès', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Erreur suppression spot', error: error.message });
  }
});

// ----------------- AUTH & USERS ROUTES -----------------

// POST /api/auth/register (For Responsables d'espace)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'Tous les champs (Nom, Email, Téléphone, Mot de passe) sont obligatoires.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ message: 'Un compte avec cet email existe déjà.' });
    }

    const isAdmin = cleanEmail === 'houssembs.tech@gmail.com';
    const newUser = new User({
      name,
      email: cleanEmail,
      phone,
      password,
      role: isAdmin ? 'admin' : 'responsable',
      canEdit: isAdmin ? true : false
    });

    await newUser.save();
    res.status(201).json({
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      canEdit: newUser.canEdit
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'inscription", error: error.message });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ message: 'Email obligatoire.' });

    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail });

    // Special auto-grant for houssembs.tech@gmail.com
    if (cleanEmail === 'houssembs.tech@gmail.com') {
      if (!user) {
        user = new User({
          name: 'Houssem Admin',
          email: cleanEmail,
          phone: '+216 20 000 000',
          password: password || 'admin',
          role: 'admin',
          canEdit: true
        });
        await user.save();
      } else {
        user.role = 'admin';
        user.canEdit = true;
        await user.save();
      }
    }

    if (!user) {
      return res.status(404).json({ message: 'Aucun compte trouvé avec cet email.' });
    }

    if (password && user.password && user.password !== password) {
      return res.status(401).json({ message: 'Mot de passe incorrect.' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      canEdit: user.canEdit
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la connexion', error: error.message });
  }
});

// GET /api/auth/users (Admin gets list of users)
app.get('/api/auth/users', async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur chargement utilisateurs', error: error.message });
  }
});

// POST /api/auth/users (Admin creates a user with chosen role)
app.post('/api/auth/users', async (req, res) => {
  try {
    const { name, email, phone, password, role, canEdit } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ message: 'Nom, email et téléphone obligatoires.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    const newUser = new User({
      name,
      email: cleanEmail,
      phone,
      password: password || '123456',
      role: role || 'responsable',
      canEdit: canEdit !== undefined ? canEdit : (role === 'admin' ? true : false)
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: 'Erreur création utilisateur', error: error.message });
  }
});

// PATCH /api/auth/users/:id/can-edit (Admin toggles edit permission)
app.patch('/api/auth/users/:id/can-edit', async (req, res) => {
  try {
    const { canEdit } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { canEdit: !!canEdit }, { new: true });
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur mise à jour permission', error: error.message });
  }
});

// App-level error handler to catch Multer/Cloudinary errors and output JSON instead of HTML
app.use((err, req, res, next) => {
  console.error('Express Global Error:', err);
  res.status(500).json({ 
    message: 'Une erreur interne bloquante est survenue',
    error: err && err.message ? err.message : (err ? err.toString() : 'Unknown')
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
