import { Schema, model } from 'mongoose';

const courierTrackingCacheSchema = new Schema({
  trackingId: { type: String, required: true, unique: true },
  courierName: { type: String, enum: ['Pathao', 'RedX', 'Sundarban'], required: true },
  latestStatus: { type: String, default: 'pending' },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

export const CourierTrackingCache = model('CourierTrackingCache', courierTrackingCacheSchema);
