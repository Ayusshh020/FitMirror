const express = require('express');
const router = express.Router();
const { uploadUserPhoto } = require('../controllers/userUpload.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.post('/upload', protect, upload.single('photo'), uploadUserPhoto);

module.exports = router;
