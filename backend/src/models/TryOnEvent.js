const mongoose = require('mongoose');

const tryOnEventSchema = new mongoose.Schema(
  {
    garment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Garment',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    retailer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    eventType: {
      type: String,
      enum: ['try_on', 'purchase_click'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

tryOnEventSchema.index({ garment: 1, retailer: 1, eventType: 1 });

module.exports = mongoose.model('TryOnEvent', tryOnEventSchema);
