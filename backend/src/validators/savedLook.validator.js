const { body } = require('express-validator');

const createSavedLookValidator = [
  body('name').trim().notEmpty().withMessage('Look name is required'),
  body('garments')
    .isArray({ min: 1 })
    .withMessage('At least one garment ID must be included'),
  body('isPublic').optional().isBoolean(),
];

module.exports = {
  createSavedLookValidator,
};
