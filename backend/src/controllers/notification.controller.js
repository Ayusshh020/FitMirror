const notificationService = require('../services/notification.service');
const Notification = require('../models/Notification');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Send notification to user (store in DB & emit via Socket.io)
// @route   POST /api/notifications/send
// @access  Private (Retailer or User)
const sendNotification = asyncHandler(async (req, res) => {
  const { recipientId, title, message } = req.body;

  if (!recipientId || !title || !message) {
    throw new ApiError(400, 'recipientId, title, and message are required');
  }

  const notification = await notificationService.sendNotification({
    recipientId,
    title,
    message,
  });

  new ApiResponse(201, { notification }, 'Notification sent successfully').send(res);
});

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getUserNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(30);

  new ApiResponse(200, { notifications }, 'Notifications retrieved').send(res);
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { read: true },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  new ApiResponse(200, { notification }, 'Notification marked as read').send(res);
});

module.exports = {
  sendNotification,
  getUserNotifications,
  markAsRead,
};
