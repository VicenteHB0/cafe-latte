import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre de la categoría es obligatorio'],
    unique: true,
    trim: true,
  }
}, {
  timestamps: true,
});

export default mongoose.models.Category || mongoose.model('Category', CategorySchema, 'menuCategories');
