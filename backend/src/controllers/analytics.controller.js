const TryOnEvent = require('../models/TryOnEvent');
const Garment = require('../models/Garment');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Track try-on or purchase click event
// @route   POST /api/analytics/track
// @access  Public / Private
const trackEvent = asyncHandler(async (req, res) => {
  const { garmentId, eventType } = req.body;

  if (!garmentId || !eventType || !['try_on', 'purchase_click'].includes(eventType)) {
    throw new ApiError(400, 'garmentId and valid eventType (try_on or purchase_click) are required');
  }

  const garment = await Garment.findById(garmentId);
  if (!garment) {
    throw new ApiError(404, 'Garment not found');
  }

  const event = await TryOnEvent.create({
    garment: garment._id,
    user: req.user ? req.user._id : null,
    retailer: garment.retailer,
    eventType,
  });

  new ApiResponse(201, { event }, 'Analytics event tracked').send(res);
});

// @desc    Get conversion metrics for retailer's garments
// @route   GET /api/analytics/conversions
// @access  Private (Retailer)
const getConversions = asyncHandler(async (req, res) => {
  const retailerId = req.user._id;

  // Get all garments of this retailer
  const garments = await Garment.find({ retailer: retailerId }).select('title imageUrl price category');

  // Aggregate event metrics
  const events = await TryOnEvent.find({ retailer: retailerId });

  let totalTryOns = 0;
  let totalPurchaseClicks = 0;

  const garmentMap = {};

  garments.forEach((g) => {
    garmentMap[g._id.toString()] = {
      garmentId: g._id,
      title: g.title,
      imageUrl: g.imageUrl,
      category: g.category,
      price: g.price,
      tryOns: 0,
      purchaseClicks: 0,
      conversionRate: '0.00%',
    };
  });

  events.forEach((event) => {
    const gId = event.garment.toString();
    if (garmentMap[gId]) {
      if (event.eventType === 'try_on') {
        garmentMap[gId].tryOns += 1;
        totalTryOns += 1;
      } else if (event.eventType === 'purchase_click') {
        garmentMap[gId].purchaseClicks += 1;
        totalPurchaseClicks += 1;
      }
    }
  });

  const garmentStats = Object.values(garmentMap).map((stat) => {
    const rate = stat.tryOns > 0 ? ((stat.purchaseClicks / stat.tryOns) * 100).toFixed(2) : '0.00';
    return {
      ...stat,
      conversionRate: `${rate}%`,
      conversionPercentage: Number(rate),
    };
  });

  const overallRate = totalTryOns > 0 ? ((totalPurchaseClicks / totalTryOns) * 100).toFixed(2) : '0.00';

  new ApiResponse(
    200,
    {
      overall: {
        totalTryOns,
        totalPurchaseClicks,
        overallConversionRate: `${overallRate}%`,
        overallPercentage: Number(overallRate),
      },
      garments: garmentStats,
    },
    'Conversion analytics fetched successfully'
  ).send(res);
});

module.exports = {
  trackEvent,
  getConversions,
};
