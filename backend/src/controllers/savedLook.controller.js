const SavedLook = require('../models/SavedLook');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Helper to generate a simple unique share token
const generateShareToken = () => {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
};

// @desc    Create a new saved look
// @route   POST /api/saved-looks
// @access  Private (User)
const createSavedLook = asyncHandler(async (req, res) => {
  const { name, garments, isPublic, previewUrl } = req.body;

  if (!garments || !Array.isArray(garments) || garments.length === 0) {
    throw new ApiError(400, 'At least one garment ID is required');
  }

  const shareToken = generateShareToken();

  const savedLook = await SavedLook.create({
    user: req.user._id,
    name,
    garments,
    previewUrl: previewUrl || '',
    isPublic: isPublic !== undefined ? isPublic : true,
    shareToken,
  });

  const populatedLook = await SavedLook.findById(savedLook._id).populate('garments');

  new ApiResponse(201, { savedLook: populatedLook }, 'Look saved successfully').send(res);
});

// @desc    Get user's saved looks
// @route   GET /api/saved-looks
// @access  Private (User)
const getSavedLooks = asyncHandler(async (req, res) => {
  const savedLooks = await SavedLook.find({ user: req.user._id })
    .populate('garments')
    .sort({ createdAt: -1 });

  new ApiResponse(200, { savedLooks }, 'Saved looks retrieved successfully').send(res);
});

// @desc    Get saved look by ID or Share Token (Public accessible if isPublic = true)
// @route   GET /api/saved-looks/:id
// @access  Public / Private
const getSavedLookById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Search by _id or shareToken
  let savedLook;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    savedLook = await SavedLook.findById(id).populate('garments').populate('user', 'name email');
  } else {
    savedLook = await SavedLook.findOne({ shareToken: id })
      .populate('garments')
      .populate('user', 'name email');
  }

  if (!savedLook) {
    throw new ApiError(404, 'Saved look not found');
  }

  // Check visibility permission
  if (!savedLook.isPublic) {
    if (!req.user || req.user._id.toString() !== savedLook.user._id.toString()) {
      throw new ApiError(403, 'This saved look is private');
    }
  }

  new ApiResponse(200, { savedLook }, 'Saved look fetched successfully').send(res);
});

// @desc    Delete saved look
// @route   DELETE /api/saved-looks/:id
// @access  Private (User)
const deleteSavedLook = asyncHandler(async (req, res) => {
  const savedLook = await SavedLook.findById(req.params.id);

  if (!savedLook) {
    throw new ApiError(404, 'Saved look not found');
  }

  if (savedLook.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to delete this saved look');
  }

  await savedLook.deleteOne();

  new ApiResponse(200, null, 'Saved look deleted successfully').send(res);
});

module.exports = {
  createSavedLook,
  getSavedLooks,
  getSavedLookById,
  deleteSavedLook,
};
