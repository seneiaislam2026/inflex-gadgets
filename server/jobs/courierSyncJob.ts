import cron from 'node-cron';
import { CourierTrackingCache } from '../models/CourierTrackingCache.ts';
import { Order } from '../models/Order.ts';
import { fetchPathaoStatus } from '../services/pathaoService.ts';
import { fetchRedxStatus } from '../services/redxService.ts';
import { fetchSundarbanStatus } from '../services/sundarbanService.ts';

// Run every 15 minutes
export const startCourierSyncJob = () => {
  cron.schedule('*/15 * * * *', async () => {
    console.log('[Job] Starting Courier Sync Job...');
    try {
      // Find orders that are shipped or pending delivery update
      const activeOrders = await Order.find({
        trackingId: { $exists: true, $ne: '' },
        deliveryStatus: { $in: ['pending', 'shipped'] }
      });

      for (const order of activeOrders) {
        let newStatus = order.deliveryStatus;
        try {
          if (order.courierName === 'Pathao') {
            newStatus = await fetchPathaoStatus(order.trackingId);
          } else if (order.courierName === 'RedX') {
            newStatus = await fetchRedxStatus(order.trackingId);
          } else if (order.courierName === 'Sundarban') {
            newStatus = await fetchSundarbanStatus(order.trackingId);
          }

          if (newStatus !== order.deliveryStatus) {
            order.deliveryStatus = newStatus;
            if (newStatus === 'delivered') order.deliveryDate = new Date();
            await order.save();
            
            // Update cache
            await CourierTrackingCache.findOneAndUpdate(
              { trackingId: order.trackingId },
              { latestStatus: newStatus, courierName: order.courierName, lastUpdated: new Date() },
              { upsert: true }
            );
          }
        } catch (err) {
          console.error(`[Job] Failed to update tracking for ${order.trackingId}:`, err);
        }
      }
      console.log('[Job] Courier Sync Job completed.');
    } catch (error) {
      console.error('[Job] Courier Sync Job failed:', error);
    }
  });
};
