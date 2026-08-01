const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
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
  img: {
    type: String
  },
  // নতুন যুক্ত করা অপশনসমূহ:
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