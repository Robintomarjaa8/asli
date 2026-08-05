import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import ErrorResponse from '../utils/errorResponse.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'asli-ecommerce',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'mp4', 'webm'],
    resource_type: 'auto',
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ErrorResponse('Invalid file type. Only images and videos are allowed.', 400), false);
    }
  },
});

// Upload multiple images
export const uploadImages = upload.array('images', 10);
export const uploadSingleImage = upload.single('image');
export const uploadVideo = upload.single('video');

export default upload;