const mongoose = require('mongoose');

const savedLookSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Look name is required'],
      trim: true,
    },
    garments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Garment',
      },
    ],
    previewUrl: {
      type: String,
      default: '',
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    shareToken: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SavedLook', savedLookSchema);
