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
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});
self.addEventListener('fetch', (event: FetchEvent) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/') as Promise<Response>)
    );
    return;
  }
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
    console.log('[SW] Starting maintenance prune...');
    event.waitUntil(
      db.pruneOldData()
        .then(() => console.log('[SW] Maintenance complete.'))
        .catch((err) => console.error('[SW] Prune failed:', err))
    );
  }
});
async function syncOutbox() {
  try {
    const unsynced = await db.telemetry.where('synced').equals(0).toArray();
    if (unsynced.length === 0) return;
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
    console.error('[SW] Sync failed:', error);
  }
}