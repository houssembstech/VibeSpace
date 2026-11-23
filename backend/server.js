require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
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

const fs = require('fs');
const path = require('path');

const PACKS_CONFIG_FILE = path.join(__dirname, 'config', 'packsConfig.json');

const DEFAULT_PACKS_CONFIG = {
  pack_1: {
    id: 'pack_1',
    name: 'Pack 01 · Visibilité Directe',
    shortName: 'Pack 01 Visibilité',
    price: 70,
    durationMonths: 12,
    graceDays: 7,
    description: 'Idéal pour lancer votre espace simplement avec une présence active.',
    features: [
      'Publication d\'un espace exclusif sur VibeSpace',
      'Nom d\'espace certifié & fixe (immuable)',
      'Réservations directes sans intermédiaire (WhatsApp & Email)',
      '0% de commission sur tous vos revenus',
      'Abonnement renouvelable'
    ],
    canEdit: false,
    isPremium: false
  },
  pack_2: {
    id: 'pack_2',
    name: 'Pack 02 · Flex Pro & Contrôle',
    shortName: 'Pack Flex Pro',
    price: 120,
    durationMonths: 12,
    graceDays: 7,
    description: 'La solution complète avec mise en avant Premium et modifications illimitées.',
    features: [
      'Tous les avantages du Pack 01 inclus',
      'Mise en avant Premium : carrousel horizontal exclusif en tête d\'accueil',
      'Modifications & Mises à jour illimitées toute l\'année',
      'Changement de photos, tarifs (heure, ½ j, jour) & description',
      'Ajustement des options, équipements et capacités',
      'Réservations directes WhatsApp & Email'
    ],
    canEdit: true,
    isPremium: true
  }
};

const getPacksConfig = () => {
  try {
    if (fs.existsSync(PACKS_CONFIG_FILE)) {
      const data = fs.readFileSync(PACKS_CONFIG_FILE, 'utf8');
      return { ...DEFAULT_PACKS_CONFIG, ...JSON.parse(data) };
    }
  } catch (e) {
    console.warn("Could not read packs config file:", e.message);
  }
  return DEFAULT_PACKS_CONFIG;
};

const savePacksConfig = (newConfig) => {
  try {
    fs.writeFileSync(PACKS_CONFIG_FILE, JSON.stringify(newConfig, null, 2), 'utf8');
  } catch (e) {
    console.warn("Could not write packs config file:", e.message);
  }
};

// Helper: Calculate dynamic pack expiration and grace period
const calculatePackDates = (purchasedAtDate, packKey = 'pack_1') => {
  const packs = getPacksConfig();
  const pack = packs[packKey] || packs['pack_1'] || DEFAULT_PACKS_CONFIG.pack_1;
  const durationMonths = Number(pack.durationMonths || 12);
  const graceDays = Number(pack.graceDays !== undefined ? pack.graceDays : 7);

  const purchased = purchasedAtDate ? new Date(purchasedAtDate) : new Date();
  const expires = new Date(purchased);
  expires.setMonth(expires.getMonth() + durationMonths);

  const grace = new Date(expires);
  grace.setDate(grace.getDate() + graceDays);

  return {
    packPurchasedAt: purchased,
    packExpiresAt: expires,
    packGraceEndsAt: grace
  };
};

const getSubscriptionStatus = (user) => {
  if (!user) return 'active';
  if (user.role === 'admin') return 'active';
  const now = new Date();

  const purchased = user.packPurchasedAt ? new Date(user.packPurchasedAt) : (user.createdAt ? new Date(user.createdAt) : now);
  const dates = calculatePackDates(purchased, user.pack || 'pack_1');
  const expiresAt = user.packExpiresAt ? new Date(user.packExpiresAt) : dates.packExpiresAt;
  const graceEndsAt = user.packGraceEndsAt ? new Date(user.packGraceEndsAt) : dates.packGraceEndsAt;

  if (now < expiresAt) {
    return 'active';
  } else if (now >= expiresAt && now < graceEndsAt) {
    return 'expired_grace'; // Alerte période de grâce
  } else {
    return 'suspended'; // Masqué après période de grâce
  }
};

const formatUserResponse = (user) => {
  const raw = user.toObject ? user.toObject() : user;
  const packKey = raw.pack || 'pack_1';
  const dates = calculatePackDates(raw.packPurchasedAt || raw.createdAt, packKey);
  const expiresAt = raw.packExpiresAt || dates.packExpiresAt;
  const graceEndsAt = raw.packGraceEndsAt || dates.packGraceEndsAt;
  const status = getSubscriptionStatus({
    ...raw,
    packExpiresAt: expiresAt,
    packGraceEndsAt: graceEndsAt
  });

  const packs = getPacksConfig();
  const configuredPack = packs[packKey] || DEFAULT_PACKS_CONFIG[packKey];
  const dynamicPrice = configuredPack ? configuredPack.price : (raw.packPrice || (packKey === 'pack_2' ? 120 : 70));

  return {
    id: raw._id,
    name: raw.name,
    spaceName: raw.spaceName,
    email: raw.email,
    phone: raw.phone,
    role: raw.role,
    canEdit: raw.canEdit,
    pack: packKey,
    packPrice: raw.packPrice || dynamicPrice,
    packPurchasedAt: raw.packPurchasedAt || dates.packPurchasedAt,
    packExpiresAt: expiresAt,
    packGraceEndsAt: graceEndsAt,
    subscriptionStatus: status,
    renewalRequest: raw.renewalRequest || { status: 'none' }
  };
};

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
      // Find suspended hosts (hosts whose 1 year + 7 days grace period is expired)
      const now = new Date();
      const suspendedUsers = await User.find({
        role: { $ne: 'admin' },
        $or: [
          { packGraceEndsAt: { $lte: now } },
          { 
            packGraceEndsAt: { $exists: false },
            packPurchasedAt: { $lte: new Date(now.getTime() - 372 * 24 * 60 * 60 * 1000) }
          }
        ]
      }, 'email');

      const suspendedEmails = suspendedUsers.map(u => (u.email || '').toLowerCase().trim()).filter(Boolean);

      // Public view: only approved spots or legacy spots without status, AND not belonging to a suspended host
      filter = {
        $and: [
          {
            $or: [
              { status: 'approved' },
              { status: { $exists: false } },
              { status: null }
            ]
          }
        ]
      };

      if (suspendedEmails.length > 0) {
        filter.$and.push({
          hostEmail: { $nin: suspendedEmails }
        });
      }
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
    const { title, description, category, location, pricePerHour, priceHalfDay, priceFullDay, maxCapacity, isUnlimitedCapacity, includedGuests, extraGuestPrice, idealFor, addons, allowedAudiences, animalFee, hostEmail, hostPhone, hostWhatsapp, hostUserId, pricingType } = req.body;
    
    const images = req.files ? req.files.map(file => file.path) : [];
    const imageUrl = images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1542751371-adc38448a05e';

    // Auto-approve if created by admin, otherwise pending
    const status = (hostEmail && hostEmail.toLowerCase() === 'houssembs.tech@gmail.com') ? 'approved' : 'pending';

    const isUnlimited = isUnlimitedCapacity === 'true' || isUnlimitedCapacity === true;
    const packCap = Number(includedGuests || maxCapacity || 10);
    const parsedMaxCap = isUnlimited ? 99999 : Math.max(packCap, Number(maxCapacity || packCap));

    const effectivePricingType = pricingType === 'day' ? 'day' : ((Number(pricePerHour) > 0 || !priceFullDay) ? 'hour' : 'day');
    const parsedPriceFullDay = Number(priceFullDay || (effectivePricingType === 'day' ? pricePerHour : 0) || 0);
    const parsedPricePerHour = Number(pricePerHour || 0);

    let isPrem = req.body.isPremium === 'true' || req.body.isPremium === true;
    if (!isPrem && hostEmail) {
      try {
        const hostUser = await User.findOne({ email: hostEmail.toLowerCase() });
        if (hostUser && (hostUser.pack === 'pack_2' || hostUser.packPrice === 120)) {
          isPrem = true;
        }
      } catch (e) {
        console.warn("Could not check host pack for premium:", e.message);
      }
    }

    const newSpot = new Spot({
      title,
      description,
      category,
      location,
      pricingType: effectivePricingType,
      pricePerHour: parsedPricePerHour,
      priceHalfDay: Number(priceHalfDay || 0),
      priceFullDay: parsedPriceFullDay,
      maxCapacity: parsedMaxCap,
      isUnlimitedCapacity: isUnlimited,
      includedGuests: packCap,
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
      status,
      isPremium: isPrem
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

// PATCH Spot Premium Status (Admin toggle)
app.patch('/api/spots/:id/premium', async (req, res) => {
  try {
    const { isPremium } = req.body;
    const updated = await Spot.findByIdAndUpdate(
      req.params.id,
      { isPremium: Boolean(isPremium) },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Spot introuvable' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Erreur mise à jour statut premium', error: error.message });
  }
});

// PATCH Spot Rating (Admin evaluation: 1.0 to 5.0 stars)
app.patch('/api/spots/:id/rating', async (req, res) => {
  try {
    const { rating } = req.body;
    const parsed = Math.min(5.0, Math.max(1.0, parseFloat(rating) || 5.0));
    const updated = await Spot.findByIdAndUpdate(
      req.params.id,
      { rating: parsed },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Spot introuvable' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Erreur mise à jour note', error: error.message });
  }
});

// GET Dynamic Packs Configuration
app.get('/api/packs-config', (req, res) => {
  res.json(getPacksConfig());
});

// PUT Dynamic Packs Configuration (Admin only)
app.put('/api/packs-config', (req, res) => {
  try {
    const updated = req.body;
    if (!updated || typeof updated !== 'object') {
      return res.status(400).json({ message: 'Configuration invalide' });
    }
    const current = getPacksConfig();
    const merged = { ...current, ...updated };
    savePacksConfig(merged);
    res.json(merged);
  } catch (err) {
    res.status(500).json({ message: 'Erreur sauvegarde packs config', error: err.message });
  }
});

// PUT Spot Edit (For authorized manager or admin)
app.put('/api/spots/:id', upload.array('images', 5), async (req, res) => {
  try {
    const spot = await Spot.findById(req.params.id);
    if (!spot) return res.status(404).json({ message: 'Spot introuvable' });

    const { title, description, category, location, pricePerHour, priceHalfDay, priceFullDay, maxCapacity, isUnlimitedCapacity, includedGuests, extraGuestPrice, idealFor, addons, allowedAudiences, animalFee, hostEmail, hostPhone, hostWhatsapp, pricingType, isPremium, rating } = req.body;

    if (pricingType) spot.pricingType = pricingType;
    if (isPremium !== undefined) spot.isPremium = isPremium === 'true' || isPremium === true;
    if (rating !== undefined) spot.rating = Math.min(5.0, Math.max(1.0, parseFloat(rating) || 5.0));
    if (title) spot.title = title;
    if (description) spot.description = description;
    if (category) spot.category = category;
    if (location) spot.location = location;
    if (pricePerHour !== undefined) spot.pricePerHour = Number(pricePerHour);
    if (priceHalfDay !== undefined) spot.priceHalfDay = Number(priceHalfDay);
    if (priceFullDay !== undefined) spot.priceFullDay = Number(priceFullDay);
    if (isUnlimitedCapacity !== undefined) {
      spot.isUnlimitedCapacity = isUnlimitedCapacity === 'true' || isUnlimitedCapacity === true;
    }
    if (includedGuests !== undefined) spot.includedGuests = Number(includedGuests);
    if (maxCapacity !== undefined) {
      spot.maxCapacity = spot.isUnlimitedCapacity ? 99999 : Math.max(spot.includedGuests || 1, Number(maxCapacity));
    }
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
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ message: 'Spot supprimé avec succès (ID non-Mongo)', id });
    }
    const deleted = await Spot.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Spot introuvable' });
    res.json({ message: 'Spot supprimé avec succès', id });
  } catch (error) {
    res.status(500).json({ message: 'Erreur suppression spot', error: error.message });
  }
});

// ----------------- AUTH & USERS ROUTES -----------------

// POST /api/auth/register (For Responsables d'espace)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, spaceName, email, phone, password, pack } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'Tous les champs obligatoires (Nom, Nom de l\'espace, Email, Téléphone, Mot de passe) doivent être remplis.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ message: 'Un compte avec cet email existe déjà.' });
    }

    const isAdmin = cleanEmail === 'houssembs.tech@gmail.com';
    const packs = getPacksConfig();
    const chosenPack = pack === 'pack_2' ? 'pack_2' : 'pack_1';
    const packConfig = packs[chosenPack] || DEFAULT_PACKS_CONFIG[chosenPack];
    const packPrice = packConfig ? packConfig.price : (chosenPack === 'pack_2' ? 120 : 70);
    const canEditAllowed = isAdmin ? true : (packConfig ? Boolean(packConfig.canEdit) : (chosenPack === 'pack_2'));

    const dates = calculatePackDates(new Date(), chosenPack);

    const newUser = new User({
      name,
      spaceName: spaceName || '',
      email: cleanEmail,
      phone,
      password,
      role: isAdmin ? 'admin' : 'responsable',
      canEdit: canEditAllowed,
      pack: chosenPack,
      packPrice,
      packPurchasedAt: dates.packPurchasedAt,
      packExpiresAt: dates.packExpiresAt,
      packGraceEndsAt: dates.packGraceEndsAt
    });

    await newUser.save();
    res.status(201).json(formatUserResponse(newUser));
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
      const dates = calculatePackDates(new Date());
      if (!user) {
        user = new User({
          name: 'Houssem Admin',
          email: cleanEmail,
          phone: '+216 20 000 000',
          password: password || 'admin',
          role: 'admin',
          canEdit: true,
          pack: 'pack_2',
          packPrice: 120,
          packPurchasedAt: dates.packPurchasedAt,
          packExpiresAt: dates.packExpiresAt,
          packGraceEndsAt: dates.packGraceEndsAt
        });
        await user.save();
      } else {
        user.role = 'admin';
        user.canEdit = true;
        user.pack = 'pack_2';
        user.packPurchasedAt = user.packPurchasedAt || dates.packPurchasedAt;
        user.packExpiresAt = user.packExpiresAt || dates.packExpiresAt;
        user.packGraceEndsAt = user.packGraceEndsAt || dates.packGraceEndsAt;
        await user.save();
      }
    }

    if (!user) {
      return res.status(404).json({ message: 'Aucun compte trouvé avec cet email.' });
    }

    if (password && user.password && user.password !== password) {
      return res.status(401).json({ message: 'Mot de passe incorrect.' });
    }

    // Auto populate dates if missing
    if (!user.packPurchasedAt || !user.packExpiresAt) {
      const dates = calculatePackDates(user.createdAt || new Date());
      user.packPurchasedAt = dates.packPurchasedAt;
      user.packExpiresAt = dates.packExpiresAt;
      user.packGraceEndsAt = dates.packGraceEndsAt;
      await user.save();
    }

    res.json(formatUserResponse(user));
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la connexion', error: error.message });
  }
});

// GET /api/auth/users (Admin gets list of users with formatted pack status)
app.get('/api/auth/users', async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    const formatted = users.map(u => formatUserResponse(u));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Erreur chargement utilisateurs', error: error.message });
  }
});

// POST /api/auth/users (Admin creates a user with chosen role)
app.post('/api/auth/users', async (req, res) => {
  try {
    const { name, spaceName, email, phone, password, role, canEdit, pack, packPurchasedAt } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ message: 'Nom, email et téléphone obligatoires.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    const chosenPack = pack || (canEdit ? 'pack_2' : 'pack_1');
    const packPrice = chosenPack === 'pack_2' ? 120 : 70;
    const dates = calculatePackDates(packPurchasedAt || new Date());

    const newUser = new User({
      name,
      spaceName: spaceName || '',
      email: cleanEmail,
      phone,
      password: password || '123456',
      role: role || 'responsable',
      canEdit: canEdit !== undefined ? canEdit : (role === 'admin' || chosenPack === 'pack_2'),
      pack: chosenPack,
      packPrice,
      packPurchasedAt: dates.packPurchasedAt,
      packExpiresAt: dates.packExpiresAt,
      packGraceEndsAt: dates.packGraceEndsAt
    });

    await newUser.save();
    res.status(201).json(formatUserResponse(newUser));
  } catch (error) {
    res.status(500).json({ message: 'Erreur création utilisateur', error: error.message });
  }
});

// PATCH /api/auth/users/:id/can-edit (Admin toggles edit permission)
app.patch('/api/auth/users/:id/can-edit', async (req, res) => {
  try {
    const { canEdit } = req.body;
    const updateData = { canEdit: !!canEdit };
    if (canEdit) {
      updateData.pack = 'pack_2';
      updateData.packPrice = 120;
    }
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    res.json(formatUserResponse(user));
  } catch (error) {
    res.status(500).json({ message: 'Erreur mise à jour permission', error: error.message });
  }
});

// POST /api/auth/request-renewal (Host submits a renewal request awaiting admin payment verification)
app.post('/api/auth/request-renewal', async (req, res) => {
  try {
    const { email, pack, requestedPack, note, paymentMethod } = req.body;
    if (!email) return res.status(400).json({ message: 'Email obligatoire.' });

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    const packToRequest = requestedPack || pack;
    const chosenPack = packToRequest === 'pack_2' ? 'pack_2' : 'pack_1';
    const packPrice = chosenPack === 'pack_2' ? 120 : 70;

    user.renewalRequest = {
      status: 'pending',
      requestedPack: chosenPack,
      requestedPackPrice: packPrice,
      requestedAt: new Date(),
      paymentMethod: paymentMethod || 'Virement / Espèces',
      note: note || '',
      decidedAt: null
    };

    await user.save();
    res.json({
      message: 'Demande de renouvellement envoyée avec succès ! L\'administrateur va vérifier votre paiement et activer votre pack.',
      user: formatUserResponse(user)
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la demande de renouvellement', error: error.message });
  }
});

// POST /api/auth/approve-renewal (Admin approves payment and officially renews the pack for 1 year)
app.post('/api/auth/approve-renewal', async (req, res) => {
  try {
    const { email, userId, pack, requestedPack } = req.body;
    let user;
    if (userId) {
      user = await User.findById(userId);
    } else if (email) {
      user = await User.findOne({ email: email.toLowerCase().trim() });
    }
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    const packs = getPacksConfig();
    const targetPack = requestedPack || pack || user.renewalRequest?.requestedPack || user.pack || 'pack_1';
    const packConfig = packs[targetPack] || DEFAULT_PACKS_CONFIG[targetPack];
    const packPrice = packConfig ? packConfig.price : (targetPack === 'pack_2' ? 120 : 70);
    const canEdit = user.role === 'admin' ? true : (packConfig ? Boolean(packConfig.canEdit) : (targetPack === 'pack_2'));

    // Official renewal: dynamic duration & grace
    const dates = calculatePackDates(new Date(), targetPack);
    user.pack = targetPack;
    user.packPrice = packPrice;
    user.canEdit = canEdit;
    user.packPurchasedAt = dates.packPurchasedAt;
    user.packExpiresAt = dates.packExpiresAt;
    user.packGraceEndsAt = dates.packGraceEndsAt;
    user.renewalRequest = {
      status: 'approved',
      requestedPack: targetPack,
      requestedPackPrice: packPrice,
      decidedAt: new Date(),
      note: 'Paiement vérifié et validé par l\'administrateur.'
    };

    await user.save();
    res.json({
      message: `Paiement vérifié ! Abonnement ${targetPack === 'pack_2' ? 'Pack Pro (120 DT)' : 'Pack 01 (70 DT)'} validé et actif pour 1 an 🚀`,
      user: formatUserResponse(user)
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur validation renouvellement', error: error.message });
  }
});

// POST /api/auth/reject-renewal (Admin rejects renewal request if payment not received)
app.post('/api/auth/reject-renewal', async (req, res) => {
  try {
    const { email, userId, reason } = req.body;
    let user;
    if (userId) {
      user = await User.findById(userId);
    } else if (email) {
      user = await User.findOne({ email: email.toLowerCase().trim() });
    }
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    user.renewalRequest = {
      status: 'rejected',
      requestedPack: user.renewalRequest?.requestedPack || user.pack || 'pack_1',
      requestedPackPrice: user.renewalRequest?.requestedPackPrice || user.packPrice || 70,
      decidedAt: new Date(),
      note: reason || 'Paiement non confirmé par l\'administrateur.'
    };

    await user.save();
    res.json({
      message: 'Demande de renouvellement rejetée.',
      user: formatUserResponse(user)
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur rejet renouvellement', error: error.message });
  }
});

// POST /api/auth/renew-pack (Admin direct renewal for 1 year)
app.post('/api/auth/renew-pack', async (req, res) => {
  try {
    const { email, pack } = req.body;
    if (!email) return res.status(400).json({ message: 'Email obligatoire.' });

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    const packs = getPacksConfig();
    const chosenPack = pack || user.renewalRequest?.requestedPack || user.pack || 'pack_1';
    const packConfig = packs[chosenPack] || DEFAULT_PACKS_CONFIG[chosenPack];
    const packPrice = packConfig ? packConfig.price : (chosenPack === 'pack_2' ? 120 : 70);
    const canEdit = user.role === 'admin' ? true : (packConfig ? Boolean(packConfig.canEdit) : (chosenPack === 'pack_2'));

    // Renewal: dynamic duration & grace
    const dates = calculatePackDates(new Date(), chosenPack);
    user.pack = chosenPack;
    user.packPrice = packPrice;
    user.canEdit = canEdit;
    user.packPurchasedAt = dates.packPurchasedAt;
    user.packExpiresAt = dates.packExpiresAt;
    user.packGraceEndsAt = dates.packGraceEndsAt;
    user.renewalRequest = {
      status: 'approved',
      requestedPack: chosenPack,
      requestedPackPrice: packPrice,
      decidedAt: new Date(),
      note: 'Renouvelé directement par l\'administrateur.'
    };

    await user.save();
    res.json({
      message: 'Abonnement annuel renouvelé avec succès pour 1 an ! 🚀',
      user: formatUserResponse(user)
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur renouvellement pack', error: error.message });
  }
});

// POST /api/auth/simulate-pack-date (Testing tool: simulate 1 year past or 1 year + 7 days past)
app.post('/api/auth/simulate-pack-date', async (req, res) => {
  try {
    const { email, mode } = req.body; // 'grace' | 'suspended' | 'reset'
    if (!email) return res.status(400).json({ message: 'Email obligatoire.' });

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    const now = new Date();
    if (mode === 'grace') {
      // Expiré il y a 2 jours : dans la période de grâce de 7 jours
      const simulatedPurchased = new Date(now);
      simulatedPurchased.setFullYear(simulatedPurchased.getFullYear() - 1);
      simulatedPurchased.setDate(simulatedPurchased.getDate() - 2);
      const dates = calculatePackDates(simulatedPurchased);
      user.packPurchasedAt = dates.packPurchasedAt;
      user.packExpiresAt = dates.packExpiresAt;
      user.packGraceEndsAt = dates.packGraceEndsAt;
    } else if (mode === 'suspended' || mode === 'expired') {
      // Expiré depuis plus de 7 jours (1 an et 10 jours passés) : espaces masqués
      const simulatedPurchased = new Date(now);
      simulatedPurchased.setFullYear(simulatedPurchased.getFullYear() - 1);
      simulatedPurchased.setDate(simulatedPurchased.getDate() - 10);
      const dates = calculatePackDates(simulatedPurchased);
      user.packPurchasedAt = dates.packPurchasedAt;
      user.packExpiresAt = dates.packExpiresAt;
      user.packGraceEndsAt = dates.packGraceEndsAt;
    } else {
      // Reset : Actif dès aujourd'hui pour 1 an
      const dates = calculatePackDates(now);
      user.packPurchasedAt = dates.packPurchasedAt;
      user.packExpiresAt = dates.packExpiresAt;
      user.packGraceEndsAt = dates.packGraceEndsAt;
    }

    await user.save();
    res.json({
      message: `Simulation "${mode}" appliquée avec succès !`,
      user: formatUserResponse(user)
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur simulation pack', error: error.message });
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
