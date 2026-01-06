import { useCallback, useEffect } from 'react';
import { db } from '@/lib/db';
import { logEvent, EventType } from '@/lib/telemetry';
import { useLiveQuery } from 'dexie-react-hooks';
export function useTelemetry() {
  const identity = useLiveQuery(() => db.identity.toCollection().first());
  const settings = useLiveQuery(() => db.settings.toArray());
  const trackEvent = useCallback(async (event: EventType, payload: any = {}) => {
    if (!identity) return;
    await logEvent(event, {
      ...payload,
      nodeId: identity.nodeId
    });
  }, [identity]);
  const syncTelemetry = useCallback(async () => {
    const unsynced = await db.telemetry.where('synced').equals(0).limit(50).toArray();
    if (unsynced.length === 0) return;
    try {
      const response = await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: unsynced })
      });
      if (response.ok) {
        const ids = unsynced.map(e => e.id).filter((id): id is number => id !== undefined);
        await db.telemetry.bulkUpdate(ids.map(id => ({
          key: id,
          changes: { synced: 1 }
        })));
      }
    } catch (error) {
      console.error('Failed to sync telemetry:', error);
    }
  }, []);
  // Periodic sync
  useEffect(() => {
    const isEnabled = settings?.find(s => s.key === 'telemetry_enabled')?.value ?? true;
    if (!isEnabled) return;
    const interval = setInterval(syncTelemetry, 60000); // Sync every minute
    return () => clearInterval(interval);
  }, [syncTelemetry, settings]);
  return { trackEvent, syncTelemetry };
}