const express = require('express');
const router = express.Router();
const { trackEvent, getConversions } = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// Track endpoint can be called anonymously or authenticated
router.post('/track', (req, res, next) => {
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
}, trackEvent);

// Conversion stats endpoint restricted to retailers
router.get('/conversions', protect, authorize('retailer'), getConversions);

module.exports = router;
