import { Schema, model } from 'mongoose';

const orderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const orderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    phone: String,
  },
  paymentMethod: { type: String, enum: ['bKash', 'Nagad', 'Stripe', 'COD'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  orderStatus: { type: String, enum: ['processing', 'shipped', 'delivered', 'cancelled'], default: 'processing' },
  // Delivery Intelligence Fields Added
  customerName: String,
  phoneNumber: String,
  courierName: { type: String, enum: ['Pathao', 'RedX', 'Sundarban', 'None'], default: 'None' },
  trackingId: String,
  deliveryStatus: { type: String, enum: ['pending', 'shipped', 'delivered', 'failed', 'returned'], default: 'pending' },
  orderDate: { type: Date, default: Date.now },
  deliveryDate: Date,
}, { timestamps: true });

export const Order = model('Order', orderSchema);
