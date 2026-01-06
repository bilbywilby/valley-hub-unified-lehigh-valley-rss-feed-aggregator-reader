# Valley Hub Node Summary
Welcome to the **Valley Hub** documentation hub. Valley Hub is a unified Lehigh Valley RSS feed aggregator and reader designed for privacy, semantic density, and regional intelligence.
## Quickstart Guide
1. **Identity Generation**: Upon first launch, your browser generates a non-extractable ECDSA P-256 key pair. This represents your unique `nodeId` in the regional mesh.
2. **Feed Management**: Navigate to the **Manage Feeds** section to load the Master List of ~120 regional sources.
3. **Synchronizing**: Use the **Update Feed** button on the Homepage to trigger the mesh ingestion process.
4. **Reading**: Articles are processed locally and stored in your browser's IndexedDB for offline-first access.
## System Prerequisites
- **Modern Browser**: Supports Web Crypto API and IndexedDB.
- **Network**: Access to the Valley Hub Sentinel API for proxying and signaling.
- **Privacy Mode**: Works best with default browser settings; high-restriction "Incognito" modes may clear your identity on close.
Valley Hub is more than a reader; it is a node in a decentralized information mesh.