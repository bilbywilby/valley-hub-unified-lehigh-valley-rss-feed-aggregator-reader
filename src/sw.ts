/// <reference lib="webworker" />
import { db } from './lib/db';
const CACHE_NAME = 'valley-hub-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest'
];
declare const self: ServiceWorkerGlobalScope;
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching application shell');
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.error('[SW] Cache installation failed:', err);
      });
    })
  );
});
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[SW] Activating regional node context');
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) => {
        return Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        );
      }),
      syncOutbox()
    ])
  );
});
self.addEventListener('fetch', (event: FetchEvent) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/') as Promise<Response>)
    );
    return;
  }
  // Bypass cache for API calls to ensure fresh mesh state
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === 'PRUNE_DATA') {
    console.log('[SW] Starting regional data maintenance...');
    event.waitUntil(
      db.pruneOldData()
        .then(() => console.log('[SW] Maintenance complete: local storage optimized'))
        .catch((err) => console.error('[SW] Maintenance failed:', err))
    );
  }
});
async function syncOutbox() {
  try {
    const unsynced = await db.telemetry.where('synced').equals(0).toArray();
    if (unsynced.length === 0) return;
    console.log(`[SW] Synchronizing ${unsynced.length} pending telemetry events`);
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
      console.log('[SW] Telemetry synchronized with mesh node');
    }
  } catch (error) {
    console.warn('[SW] Outbox sync postponed: connection unavailable');
  }
}