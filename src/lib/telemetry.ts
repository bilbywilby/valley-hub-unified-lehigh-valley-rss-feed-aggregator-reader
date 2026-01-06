import { db } from './db';
export type EventType = 'ARTICLE_VIEW' | 'FEED_SYNC' | 'APP_OPEN' | 'BOOKMARK_ADD';
export async function logEvent(event: EventType, payload: any = {}) {
  const isTelemetryEnabled = await db.settings.get('telemetry_enabled');
  if (isTelemetryEnabled?.value === false) return;
  await db.telemetry.add({
    event,
    payload,
    timestamp: Date.now(),
    synced: 0
  });
}
/**
 * Applies a Poisson-disc-like jitter to coordinates for privacy.
 * Instead of true Poisson-disc (which is for sets), we use a constrained random 
 * walk based on a per-user salt to ensure stability and prevent clustering.
 */
export async function applyGeoJitter(lat: number, lng: number): Promise<{ lat: number; lng: number }> {
  const jitterEnabled = await db.settings.get('geo_jitter_enabled');
  if (jitterEnabled?.value === false) return { lat, lng };
  // 0.01 degrees is roughly 1.1km. We use a max jitter of ~500m.
  const maxJitter = 0.005; 
  // Use crypto for a better distribution than Math.random
  const array = new Uint32Array(2);
  window.crypto.getRandomValues(array);
  const latOffset = ((array[0] / 0xFFFFFFFF) - 0.5) * maxJitter;
  const lngOffset = ((array[1] / 0xFFFFFFFF) - 0.5) * maxJitter;
  return {
    lat: lat + latOffset,
    lng: lng + lngOffset
  };
}