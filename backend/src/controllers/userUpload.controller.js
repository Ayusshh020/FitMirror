const storageService = require('../services/storage.service');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Upload full body photo for user profile / fitting room
// @route   POST /api/user/upload
// @access  Private (User)
const uploadUserPhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Please upload an image file');
  }

  // Upload file via Storage Service
  const photoUrl = await storageService.uploadFile(req.file);

  // Update user profile photoUrl
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { photoUrl },
    { new: true }
  ).select('-password');

  new ApiResponse(200, { photoUrl, user }, 'User full-body photo uploaded successfully').send(res);
});

module.exports = {
  uploadUserPhoto,
};
