const mongoose = require('mongoose');

const garmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Garment title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    size: {
      type: String,
      default: 'M',
    },
    availableSizes: {
      type: [String],
      default: ['S', 'M', 'L', 'XL'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    purchaseUrl: {
      type: String,
      default: '',
    },
    retailer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

garmentSchema.index({ category: 1, size: 1, title: 'text' });

module.exports = mongoose.model('Garment', garmentSchema);
