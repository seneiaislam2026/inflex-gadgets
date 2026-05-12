import { Schema, model } from 'mongoose';

const productSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  stock: { type: Number, default: 0 },
  images: [{ type: String }],
  specifications: [{ name: String, value: String }],
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

export const Product = model('Product', productSchema);
