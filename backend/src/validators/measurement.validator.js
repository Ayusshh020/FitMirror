const { body } = require('express-validator');

const updateMeasurementValidator = [
  body('height').isNumeric().withMessage('Height must be a number in cm'),
  body('weight').isNumeric().withMessage('Weight must be a number in kg'),
  body('chest').isNumeric().withMessage('Chest measurement must be a number in cm'),
  body('waist').isNumeric().withMessage('Waist measurement must be a number in cm'),
  body('hips').isNumeric().withMessage('Hips measurement must be a number in cm'),
  body('shoulder').optional().isNumeric(),
  body('preferredFit')
    .optional()
    .isIn(['tight', 'regular', 'oversized'])
    .withMessage('Preferred fit must be tight, regular, or oversized'),
];

module.exports = {
  updateMeasurementValidator,
};
