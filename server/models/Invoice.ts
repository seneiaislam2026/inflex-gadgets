import { Schema, model } from 'mongoose';

const invoiceItemSchema = new Schema({
  description: String,
  quantity: Number,
  unitPrice: Number,
  total: Number,
});

const invoiceSchema = new Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerEmail: String,
  customerAddress: String,
  items: [invoiceItemSchema],
  subtotal: { type: Number, required: true },
  taxAmount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  status: { type: String, enum: ['draft', 'sent', 'paid', 'cancelled'], default: 'draft' },
}, { timestamps: true });

export const Invoice = model('Invoice', invoiceSchema);
