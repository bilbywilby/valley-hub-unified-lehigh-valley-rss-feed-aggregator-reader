/// <reference lib="webworker" />
import { db } from './lib/db';
const CACHE_NAME = 'valley-hub-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest'
];
declare const self: ServiceWorkerGlobalScope;
// Installation: Cache App Shell
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching regional application shell');
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.error('[SW] Cache installation failed:', err);
      });
    })
  );
});
// Activation: Cleanup and Initial Maintenance
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[SW] Regional node context activated');
  event.waitUntil(
    Promise.all([
      // Cleanup old caches
      caches.keys().then((keys) => {
        return Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        );
      }),
      // Immediate telemetry sync attempt
      syncOutbox(),
      // Claim clients immediately
      self.clients.claim()
    ])
  );
});
// Fetching: Hybrid Strategy (Network-first for API, Cache-first for Assets)
self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url);
  // Bypass cache for all regional mesh API signaling
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }
  // Navigation handling for SPA
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/') as Promise<Response>)
    );
    return;
  }
  // Static assets: Cache falling back to Network
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
// Periodic/Messaging Maintenance
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === 'PRUNE_DATA') {
    console.log('[SW] Starting regional node storage maintenance...');
    event.waitUntil(
      db.pruneOldData()
        .then(() => console.log('[SW] Local node storage optimized and pruned'))
        .catch((err) => console.error('[SW] Maintenance failure:', err))
    );
  }
});
/**
 * Background outbox sync for regional telemetry.
 * Safe for worker context as it uses 'fetch' and IndexedDB.
 */
async function syncOutbox() {
  try {
    const unsynced = await db.telemetry.where('synced').equals(0).toArray();
    if (unsynced.length === 0) return;
    console.log(`[SW] Attempting to sync ${unsynced.length} pending telemetry signals`);
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
      console.log('[SW] Telemetry reconciled with mesh network');
    }
  } catch (error) {
    console.warn('[SW] Regional outbox sync postponed: network unreachable');
  }
}