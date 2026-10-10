const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || 'racine').toLowerCase(),
  api_key: process.env.CLOUDINARY_API_KEY || '898447688717591',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'QS6cBpGkVjQIMCneBuO_oaPvDKw',
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'vibespace_spots',
    allowedFormats: ['jpeg', 'png', 'jpg', 'webp'],
  },
});

const upload = multer({ storage });

module.exports = { cloudinary, upload };
