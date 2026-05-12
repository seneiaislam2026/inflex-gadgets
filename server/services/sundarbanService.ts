import { DeliveryStatus } from './pathaoService.ts';

export const fetchSundarbanStatus = async (trackingId: string): Promise<DeliveryStatus> => {
  // Mock fallback if courier API unavailable
  console.log(`Fetching Sundarban status for ${trackingId}...`);
  const statuses: DeliveryStatus[] = ['delivered', 'failed', 'shipped', 'returned'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  return randomStatus;
};
