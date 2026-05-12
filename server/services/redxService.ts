import { DeliveryStatus } from './pathaoService.ts';

export const fetchRedxStatus = async (trackingId: string): Promise<DeliveryStatus> => {
  // Mock fallback if courier API unavailable
  console.log(`Fetching RedX status for ${trackingId}...`);
  const statuses: DeliveryStatus[] = ['delivered', 'failed', 'shipped', 'returned'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  return randomStatus;
};
