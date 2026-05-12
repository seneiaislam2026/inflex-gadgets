import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });

export const User = model('User', userSchema);
