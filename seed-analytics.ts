import 'dotenv/config';
import mongoose from 'mongoose';
import { Order } from './server/models/Order.ts';
import { CourierTrackingCache } from './server/models/CourierTrackingCache.ts';

const seedData = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.log('No MONGO_URI specified');
      return;
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    // Create a customer with a specific phone number
    const examplePhone = '01711223344';

    // Delete existing test orders for this phone to avoid clutter
    await Order.deleteMany({ phoneNumber: examplePhone });
    
    const sampleOrders = [
      {
        customerName: 'Test Customer',
        phoneNumber: examplePhone,
        totalAmount: 1200,
        courierName: 'Pathao',
        trackingId: 'PTH-1001',
        deliveryStatus: 'delivered',
        orderDate: new Date('2023-10-01'),
        deliveryDate: new Date('2023-10-04'),
        items: [{
          product: new mongoose.Types.ObjectId(),
          name: 'Classic White T-Shirt',
          quantity: 2,
          price: 600
        }],
        paymentMethod: 'COD',
        orderStatus: 'delivered'
      },
      {
        customerName: 'Test Customer',
        phoneNumber: examplePhone,
        totalAmount: 550,
        courierName: 'RedX',
        trackingId: 'RDX-1002',
        deliveryStatus: 'failed',
        orderDate: new Date('2023-10-15'),
        items: [{
          product: new mongoose.Types.ObjectId(),
          name: 'Black Cap',
          quantity: 1,
          price: 550
        }],
        paymentMethod: 'COD',
        orderStatus: 'cancelled'
      },
      {
        customerName: 'Test Customer',
        phoneNumber: examplePhone,
        totalAmount: 3200,
        courierName: 'Sundarban',
        trackingId: 'SND-1003',
        deliveryStatus: 'pending',
        orderDate: new Date(),
        items: [{
          product: new mongoose.Types.ObjectId(),
          name: 'Denim Jacket',
          quantity: 1,
          price: 3200
        }],
        paymentMethod: 'bKash',
        paymentStatus: 'paid',
        orderStatus: 'shipped'
      }
    ];

    await Order.insertMany(sampleOrders);
    console.log('Sample delivery data inserted for phone: ' + examplePhone);

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed', error);
    process.exit(1);
  }
};

seedData();
