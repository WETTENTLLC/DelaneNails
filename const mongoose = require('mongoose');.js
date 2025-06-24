const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A service must have a name'],
    trim: true,
    maxlength: [40, 'A service name must have less than or equal to 40 characters'],
    minlength: [5, 'A service name must have more than or equal to 5 characters']
  },
  description: {
    type: String,
    trim: true,
    required: [true, 'A service must have a description']
  },
  duration: {
    type: Number,
    required: [true, 'A service must have a duration in minutes']
  },
  price: {
    type: Number,
    required: [true, 'A service must have a price']
  },
  images: [String],
  category: {
    type: String,
    required: [true, 'A service must have a category'],
    enum: {
      values: ['manicure', 'pedicure', 'nail-art', 'extensions', 'special'],
      message: 'Category must be either: manicure, pedicure, nail-art, extensions, or special'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },
  isPopular: {
    type: Boolean,
    default: false
  }
});

// Index for faster searches
serviceSchema.index({ price: 1, category: 1 });

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
