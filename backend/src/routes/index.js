const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const garmentRoutes = require('./garment.routes');
const measurementRoutes = require('./measurement.routes');
const savedLookRoutes = require('./savedLook.routes');
const recommendationRoutes = require('./recommendation.routes');
const analyticsRoutes = require('./analytics.routes');
const notificationRoutes = require('./notification.routes');
const userUploadRoutes = require('./userUpload.routes');

router.use('/auth', authRoutes);
router.use('/garments', garmentRoutes);
router.use('/measurements', measurementRoutes);
router.use('/saved-looks', savedLookRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationRoutes);
router.use('/user', userUploadRoutes);

module.exports = router;
