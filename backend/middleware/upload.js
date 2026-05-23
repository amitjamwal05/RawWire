const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'rawwire',
    resource_type: 'auto', // allows video and image
    allowed_formats: ['jpg', 'png', 'jpeg', 'svg', 'mp4', 'mov', 'webm'],
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
