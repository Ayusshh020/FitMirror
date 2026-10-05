const express = require('express');
const router = express.Router();
const { sendNotification, getUserNotifications, markAsRead } = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);

router.post('/send', authorize('retailer'), sendNotification);
router.get('/', getUserNotifications);
router.put('/:id/read', markAsRead);

module.exports = router;
