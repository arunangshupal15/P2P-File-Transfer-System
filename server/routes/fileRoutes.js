// server/routes/fileRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authMiddleware } = require('../middleware/authMiddleware'); // Import your middleware
const { uploadFile, getFiles, downloadFile, searchFiles } = require('../controllers/fileController');

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// Apply authMiddleware to all routes except file upload (already applied)
router.post('/upload', authMiddleware, upload.single('file'), uploadFile); // Protected
router.get('/', authMiddleware, getFiles); // Protected
router.get('/download/:id', authMiddleware, downloadFile); // Protected
router.get('/search', authMiddleware, searchFiles); // Protected

module.exports = router;
