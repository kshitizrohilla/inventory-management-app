import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide product name'],
  },
  barcode: {
    type: String,
    sparse: true,
  },
  category: {
    type: String,
    required: [true, 'Please provide product category'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide product price'],
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide product quantity'],
  },
  description: {
    type: String,
    required: [true, 'Please provide product description'],
  },
  imageUrl: {
    type: String,
    required: [true, 'Please provide product image URL'],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ProductSchema.index({ user: 1, barcode: 1 }, { unique: true });
export default mongoose.models.Product || mongoose.model('Product', ProductSchema);