import cron from 'node-cron';
import admin from 'firebase-admin';
import { fetchPathaoStatus } from '../services/pathaoService.ts';
import { fetchRedxStatus } from '../services/redxService.ts';
import { fetchSundarbanStatus } from '../services/sundarbanService.ts';

// Run every 15 minutes
export const startCourierSyncJob = () => {
  cron.schedule('*/15 * * * *', async () => {
    console.log('[Job] Starting Courier Sync Job...');
    const db = admin.firestore();
    try {
      // Find orders that are shipped or pending delivery update
      const activeOrdersSnapshot = await db.collection('orders')
        .where('trackingId', '!=', '')
        .where('deliveryStatus', 'in', ['pending', 'shipped'])
        .get();

      if (activeOrdersSnapshot.empty) {
        console.log('[Job] No active orders for sync.');
        return;
      }

      for (const doc of activeOrdersSnapshot.docs) {
        const order = doc.data();
        const orderId = doc.id;
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
            const updates: any = {
              deliveryStatus: newStatus,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            };
            
            if (newStatus === 'delivered') {
              updates.deliveryDate = admin.firestore.FieldValue.serverTimestamp();
            }
            
            await db.collection('orders').doc(orderId).update(updates);
            
            // Update cache/tracking collection
            await db.collection('courierTrackingCache').doc(order.trackingId).set({
              trackingId: order.trackingId,
              latestStatus: newStatus,
              courierName: order.courierName,
              lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
            
            console.log(`[Job] Updated order ${orderId} to status ${newStatus}`);
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
