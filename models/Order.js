import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: Number,
    required: true,
  },
  customerName: {
    type: String,
    default: 'Cliente',
    trim: true,
  },
  phoneNumber: {
    type: String,
    trim: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      name: String, // Store name in case product is deleted/changed
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number, // Price at time of order
        required: true,
      },
      size: {
        label: String,
        price: Number,
      },
      extras: [
        {
          name: String,
          price: Number,
        }
      ],
      customizations: [String], // e.g. "Sin hielo", "Extra caliente"
    }
  ],
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'transfer'],
    default: 'cash',
  },
  notes: {
    type: String,
    trim: true,
  }
}, {
  timestamps: true,
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
