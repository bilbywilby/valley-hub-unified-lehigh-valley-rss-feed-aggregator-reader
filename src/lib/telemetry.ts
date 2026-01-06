import { db } from './db';
export type EventType = 'ARTICLE_VIEW' | 'FEED_SYNC' | 'APP_OPEN' | 'BOOKMARK_ADD';
/**
 * Logs a privacy-preserved telemetry event to the local database for eventual mesh synchronization.
 */
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
 * Standardizes on global 'crypto' for environment compatibility (Workers, Windows).
 */
export async function applyGeoJitter(lat: number, lng: number): Promise<{ lat: number; lng: number }> {
  const jitterEnabled = await db.settings.get('geo_jitter_enabled');
  if (jitterEnabled?.value === false) return { lat, lng };
  // 0.01 degrees is roughly 1.1km. We use a max jitter of ~500m.
  const maxJitter = 0.005;
  // Use global crypto for environment resilience
  const array = new Uint32Array(2);
  crypto.getRandomValues(array);
  const latOffset = ((array[0] / 0xFFFFFFFF) - 0.5) * maxJitter;
  const lngOffset = ((array[1] / 0xFFFFFFFF) - 0.5) * maxJitter;
  return {
    lat: lat + latOffset,
    lng: lng + lngOffset
  };
}