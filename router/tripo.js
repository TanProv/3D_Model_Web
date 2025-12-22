import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  generateFromText,
  generateFromImageUrl,
  generateFromImageFile,
  checkGenerationStatus
} from '../controllers/tripoController.js';

const router = express.Router();

// Test route
router.get('/', (req, res) => {
  res.json({
    message: 'Tripo AI routes are working!',
    endpoints: {
      text: 'POST /api/tripo/generate/text',
      imageUrl: 'POST /api/tripo/generate/image-url',
      imageFile: 'POST /api/tripo/generate/image-file',
      status: 'GET /api/tripo/status/:taskId'
    }
  });
});

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'data/temp');
  },
  filename: (req, file, cb) => {
    cb(null, `temp_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Routes
router.post('/generate/text', generateFromText);
router.post('/generate/image-url', generateFromImageUrl);
router.post('/generate/image-file', upload.single('image'), generateFromImageFile);
router.get('/status/:taskId', checkGenerationStatus);

export default router;