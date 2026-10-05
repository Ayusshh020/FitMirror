const express = require('express');
const router = express.Router();
const {
  getGarments,
  getGarmentById,
  createGarment,
  updateGarment,
  deleteGarment,
} = require('../controllers/garment.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');
const { createGarmentValidator, updateGarmentValidator } = require('../validators/garment.validator');
const validate = require('../middleware/validate.middleware');

router.get('/', getGarments);
router.get('/:id', getGarmentById);

router.post('/', protect, authorize('retailer'), upload.single('image'), createGarmentValidator, validate, createGarment);
router.put('/:id', protect, authorize('retailer'), upload.single('image'), updateGarmentValidator, validate, updateGarment);
router.delete('/:id', protect, authorize('retailer'), deleteGarment);

module.exports = router;
