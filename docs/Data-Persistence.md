# Local Data Persistence
Valley Hub treats the browser's IndexedDB as the primary source of truth, ensuring an offline-first experience and complete user control over data.
## Schema Strategy (Dexie.js)
The system uses `ValleyHubDB` with the following core tables:
- `articles`: Primary store for news content (indexed by `id`, `hash`, `pubDate`).
- `feeds`: Configuration for RSS sources and their IQS metrics.
- `identity`: Stores the cryptographic public key and `nodeId`.
- `telemetry`: Local queue for outbound privacy-preserved events.
- `votes`: History of local quality assessments.
## Data Lifecycle & Pruning
To maintain optimal performance, the Service Worker triggers a maintenance cycle:
- **Articles**: Non-bookmarked articles older than **24 hours** are automatically purged.
- **Telemetry**: Successfully synchronized events older than **48 hours** are removed.
- **Identity**: Persists indefinitely until the user manually triggers a "Reset All Data" in Settings.