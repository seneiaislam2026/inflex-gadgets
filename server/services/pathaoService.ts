export type DeliveryStatus = 'pending' | 'shipped' | 'delivered' | 'failed' | 'returned';

export const fetchPathaoStatus = async (trackingId: string): Promise<DeliveryStatus> => {
  // Mock fallback if courier API unavailable
  console.log(`Fetching Pathao status for ${trackingId}...`);
  // Mock statuses: 'delivered', 'failed', 'shipped'
  const statuses: DeliveryStatus[] = ['delivered', 'failed', 'shipped', 'pending'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  return randomStatus;
};
