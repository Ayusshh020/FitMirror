const mongoose = require('mongoose');

const measurementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    height: {
      type: Number, // in cm
      required: true,
      min: 50,
      max: 250,
    },
    weight: {
      type: Number, // in kg
      required: true,
      min: 20,
      max: 300,
    },
    chest: {
      type: Number, // in cm
      required: true,
      min: 40,
      max: 200,
    },
    waist: {
      type: Number, // in cm
      required: true,
      min: 40,
      max: 200,
    },
    hips: {
      type: Number, // in cm
      required: true,
      min: 40,
      max: 200,
    },
    shoulder: {
      type: Number, // in cm
      default: 44,
    },
    preferredFit: {
      type: String,
      enum: ['tight', 'regular', 'oversized'],
      default: 'regular',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Measurement', measurementSchema);
