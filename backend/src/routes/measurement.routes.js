const express = require('express');
const router = express.Router();
const { updateMeasurements, getMeasurements } = require('../controllers/measurement.controller');
const { updateMeasurementValidator } = require('../validators/measurement.validator');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', getMeasurements);
router.put('/', updateMeasurementValidator, validate, updateMeasurements);

module.exports = router;
