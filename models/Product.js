import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del producto es obligatorio'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'La categoría es obligatoria'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
  },
  image: {
    type: String,
  },
  available: {
    type: Boolean,
    default: true,
  },
  sizes: [
    {
      label: String,
      price: Number,
    }
  ],
  extras: [
    {
      name: String,
      price: Number,
    }
  ],
  flavors: [String],
  options: {
    pieces: Number,
    sauces: [String],
  },
}, {
  timestamps: true,
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema, 'menuProducts');
