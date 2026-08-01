const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'General'
  },
  type: {
    type: String
  },
  details: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    default: 0
  },
  sizes: [
    { type: String }
  ],
  images: [
    { type: String } // একাধিক ইমেজের লিংক বা Base64 রাখার জন্য অ্যারে
  ],
  isFeatured: {
    type: Boolean,
    default: false
  },
  isHidden: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);