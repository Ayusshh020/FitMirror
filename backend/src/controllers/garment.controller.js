const Garment = require('../models/Garment');
const storageService = require('../services/storage.service');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all garments with filtering, search & pagination
// @route   GET /api/garments
// @access  Public
const getGarments = asyncHandler(async (req, res) => {
  const { category, size, search, page = 1, limit = 12, retailer } = req.query;

  const conditions = [];

  if (category) {
    conditions.push({ category: new RegExp(`^${category}$`, 'i') });
  }

  if (size) {
    conditions.push({
      $or: [{ size: size.toUpperCase() }, { availableSizes: size.toUpperCase() }],
    });
  }

  if (retailer) {
    conditions.push({ retailer });
  }

  if (search) {
    conditions.push({
      $or: [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') },
      ],
    });
  }

  const query = conditions.length > 0 ? { $and: conditions } : {};

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const total = await Garment.countDocuments(query);
  const garments = await Garment.find(query)
    .populate('retailer', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  new ApiResponse(
    200,
    {
      garments,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum,
      },
    },
    'Garments retrieved successfully'
  ).send(res);
});

// @desc    Get single garment by ID
// @route   GET /api/garments/:id
// @access  Public
const getGarmentById = asyncHandler(async (req, res) => {
  const garment = await Garment.findById(req.params.id).populate('retailer', 'name email');

  if (!garment) {
    throw new ApiError(404, 'Garment not found');
  }

  new ApiResponse(200, { garment }, 'Garment details fetched').send(res);
});

// @desc    Create new garment (retailer only)
// @route   POST /api/garments
// @access  Private (Retailer)
const createGarment = asyncHandler(async (req, res) => {
  const { title, description, category, price, size, availableSizes, purchaseUrl, imageUrl } = req.body;

  let finalImageUrl = imageUrl || '';

  if (req.file) {
    finalImageUrl = await storageService.uploadFile(req.file);
  }

  if (!finalImageUrl) {
    throw new ApiError(400, 'Garment image file or imageUrl is required');
  }

  let parsedAvailableSizes = ['S', 'M', 'L', 'XL'];
  if (availableSizes) {
    if (typeof availableSizes === 'string') {
      parsedAvailableSizes = availableSizes.split(',').map((s) => s.trim().toUpperCase());
    } else if (Array.isArray(availableSizes)) {
      parsedAvailableSizes = availableSizes;
    }
  }

  const garment = await Garment.create({
    title,
    description: description || '',
    category,
    price: Number(price),
    size: size ? size.toUpperCase() : 'M',
    availableSizes: parsedAvailableSizes,
    imageUrl: finalImageUrl,
    purchaseUrl: purchaseUrl || '',
    retailer: req.user._id,
  });

  new ApiResponse(201, { garment }, 'Garment created successfully').send(res);
});

// @desc    Update garment (owner retailer only)
// @route   PUT /api/garments/:id
// @access  Private (Retailer)
const updateGarment = asyncHandler(async (req, res) => {
  const garment = await Garment.findById(req.params.id);

  if (!garment) {
    throw new ApiError(404, 'Garment not found');
  }

  // Check ownership
  if (garment.retailer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to update this garment');
  }

  const { title, description, category, price, size, availableSizes, purchaseUrl, imageUrl } = req.body;

  if (title) garment.title = title;
  if (description !== undefined) garment.description = description;
  if (category) garment.category = category;
  if (price !== undefined) garment.price = Number(price);
  if (size) garment.size = size.toUpperCase();
  if (purchaseUrl !== undefined) garment.purchaseUrl = purchaseUrl;

  if (availableSizes) {
    if (typeof availableSizes === 'string') {
      garment.availableSizes = availableSizes.split(',').map((s) => s.trim().toUpperCase());
    } else if (Array.isArray(availableSizes)) {
      garment.availableSizes = availableSizes;
    }
  }

  if (req.file) {
    // Delete old image if it was local
    await storageService.deleteFile(garment.imageUrl);
    garment.imageUrl = await storageService.uploadFile(req.file);
  } else if (imageUrl) {
    garment.imageUrl = imageUrl;
  }

  await garment.save();

  new ApiResponse(200, { garment }, 'Garment updated successfully').send(res);
});

// @desc    Delete garment (owner retailer only)
// @route   DELETE /api/garments/:id
// @access  Private (Retailer)
const deleteGarment = asyncHandler(async (req, res) => {
  const garment = await Garment.findById(req.params.id);

  if (!garment) {
    throw new ApiError(404, 'Garment not found');
  }

  if (garment.retailer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to delete this garment');
  }

  await storageService.deleteFile(garment.imageUrl);
  await garment.deleteOne();

  new ApiResponse(200, null, 'Garment deleted successfully').send(res);
});

module.exports = {
  getGarments,
  getGarmentById,
  createGarment,
  updateGarment,
  deleteGarment,
};
