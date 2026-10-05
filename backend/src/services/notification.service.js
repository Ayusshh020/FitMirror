const Notification = require('../models/Notification');
const { getIO } = require('../config/socket');

/**
 * Service to create a notification in database and emit real-time Socket.io message to recipient room
 */
const sendNotification = async ({ recipientId, title, message }) => {
  const notification = await Notification.create({
    recipient: recipientId,
    title,
    message,
    read: false,
  });

  try {
    const io = getIO();
    io.to(recipientId.toString()).emit('notification', {
      _id: notification._id,
      recipient: notification.recipient,
      title: notification.title,
      message: notification.message,
      read: notification.read,
      createdAt: notification.createdAt,
    });
    console.log(`[Notification] Emitted to room user ${recipientId}: "${title}"`);
  } catch (err) {
    console.warn(`[Notification Warning] Socket notification dispatch failed: ${err.message}`);
  }

  return notification;
};

module.exports = {
  sendNotification,
};
