const Garment = require('../models/Garment');

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

/**
 * Calculates recommended clothing size based on body measurements.
 * @param {Object} measurements - { chest, waist, hips, height, weight, preferredFit }
 * @returns {Object} { recommendedSize, chestSize, waistSize, fitAdvice }
 */
const calculateRecommendedSize = (measurements) => {
  if (!measurements) {
    return { recommendedSize: 'M', fitAdvice: 'Default size (no measurements provided)' };
  }

  const { chest, waist, hips, preferredFit = 'regular' } = measurements;

  // Chest size mapping (cm)
  let chestIdx = 2; // Default M
  if (chest < 88) chestIdx = 0; // XS
  else if (chest <= 95) chestIdx = 1; // S
  else if (chest <= 103) chestIdx = 2; // M
  else if (chest <= 111) chestIdx = 3; // L
  else if (chest <= 119) chestIdx = 4; // XL
  else chestIdx = 5; // XXL

  // Waist size mapping (cm)
  let waistIdx = 2;
  if (waist < 74) waistIdx = 0;
  else if (waist <= 81) waistIdx = 1;
  else if (waist <= 89) waistIdx = 2;
  else if (waist <= 97) waistIdx = 3;
  else if (waist <= 105) waistIdx = 4;
  else waistIdx = 5;

  // Take the primary size index (max of chest and waist for better fit)
  let primaryIdx = Math.max(chestIdx, waistIdx);

  // Apply user preference adjustment
  if (preferredFit === 'tight' && primaryIdx > 0) {
    primaryIdx -= 1;
  } else if (preferredFit === 'oversized' && primaryIdx < SIZES.length - 1) {
    primaryIdx += 1;
  }

  const recommendedSize = SIZES[primaryIdx];
  const fitAdvice = `Based on your chest (${chest}cm) and waist (${waist}cm) with a ${preferredFit} fit preference.`;

  return {
    recommendedSize,
    chestSize: SIZES[chestIdx],
    waistSize: SIZES[waistIdx],
    fitAdvice,
  };
};

/**
 * Fetch garments recommended for user based on size matching
 */
const getRecommendedGarments = async (measurements, queryCategory) => {
  const { recommendedSize } = calculateRecommendedSize(measurements);

  const filter = {
    $or: [{ availableSizes: recommendedSize }, { size: recommendedSize }],
  };

  if (queryCategory) {
    filter.category = new RegExp(queryCategory, 'i');
  }

  const garments = await Garment.find(filter).populate('retailer', 'name email').lean();

  // If few garments match exact size, fallback to fetch all available garments
  if (garments.length === 0) {
    return await Garment.find({}).populate('retailer', 'name email').limit(10).lean();
  }

  return garments;
};

module.exports = {
  calculateRecommendedSize,
  getRecommendedGarments,
};
