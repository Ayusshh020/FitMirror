const Measurement = require('../models/Measurement');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { calculateRecommendedSize } = require('../services/recommendation.service');

// @desc    Create or update body measurements for logged-in user
// @route   PUT /api/measurements
// @access  Private (User)
const updateMeasurements = asyncHandler(async (req, res) => {
  const { height, weight, chest, waist, hips, shoulder, preferredFit } = req.body;

  const measurementData = {
    user: req.user._id,
    height: Number(height),
    weight: Number(weight),
    chest: Number(chest),
    waist: Number(waist),
    hips: Number(hips),
    shoulder: shoulder ? Number(shoulder) : 44,
    preferredFit: preferredFit || 'regular',
  };

  const measurements = await Measurement.findOneAndUpdate(
    { user: req.user._id },
    measurementData,
    { new: true, upsert: true, runValidators: true }
  );

  const recommendation = calculateRecommendedSize(measurements);

  new ApiResponse(
    200,
    { measurements, sizeRecommendation: recommendation },
    'Measurements saved successfully'
  ).send(res);
});

// @desc    Get body measurements for logged-in user
// @route   GET /api/measurements
// @access  Private (User)
const getMeasurements = asyncHandler(async (req, res) => {
  const measurements = await Measurement.findOne({ user: req.user._id });

  const recommendation = measurements ? calculateRecommendedSize(measurements) : null;

  new ApiResponse(
    200,
    { measurements, sizeRecommendation: recommendation },
    'Measurements retrieved successfully'
  ).send(res);
});

module.exports = {
  updateMeasurements,
  getMeasurements,
};
