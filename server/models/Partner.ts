import { Schema, model } from 'mongoose';

const partnerSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  investmentAmount: { type: Number, required: true },
  profitSharePercentage: { type: Number, required: true },
  joinDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

export const Partner = model('Partner', partnerSchema);
