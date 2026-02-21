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
  flavors: [
    {
      name: String,
      price: {
        type: Number,
        default: 0
      }
    }
  ],
  options: {
    pieces: Number,
    sauces: [String],
  },
}, {
  timestamps: true,
});

// Para evitar problemas de caché con Next.js Hot Reloading
if (mongoose.models.Product) {
  delete mongoose.models.Product;
}

export default mongoose.model('Product', ProductSchema, 'menuProducts');
