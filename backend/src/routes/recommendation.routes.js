const express = require('express');
const router = express.Router();
const { getRecommendations, getSizeRecommendation } = require('../controllers/recommendation.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', getRecommendations);
router.get('/size', getSizeRecommendation);

module.exports = router;
