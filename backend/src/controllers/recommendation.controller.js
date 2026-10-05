const Measurement = require('../models/Measurement');
const recommendationService = require('../services/recommendation.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get garments recommended for the logged-in user
// @route   GET /api/recommendations
// @access  Private (User)
const getRecommendations = asyncHandler(async (req, res) => {
  const { category } = req.query;

  const measurements = await Measurement.findOne({ user: req.user._id });

  const sizeResult = recommendationService.calculateRecommendedSize(measurements);
  const recommendedGarments = await recommendationService.getRecommendedGarments(
    measurements,
    category
  );

  new ApiResponse(
    200,
    {
      recommendedSize: sizeResult.recommendedSize,
      fitAdvice: sizeResult.fitAdvice,
      garments: recommendedGarments,
    },
    'Recommended garments retrieved successfully'
  ).send(res);
});

// @desc    Get size recommendation (S/M/L/XL) computed from user measurements
// @route   GET /api/recommendations/size
// @access  Private (User)
const getSizeRecommendation = asyncHandler(async (req, res) => {
  const measurements = await Measurement.findOne({ user: req.user._id });

  const recommendation = recommendationService.calculateRecommendedSize(measurements);

  new ApiResponse(200, { recommendation }, 'Size recommendation computed').send(res);
});

module.exports = {
  getRecommendations,
  getSizeRecommendation,
};
