# Regional Mesh System Design
Valley Hub utilizes a hybrid architecture combining client-side persistence with a Cloudflare Workers-based signaling and proxy layer.
## Architecture Components
### 1. Network Sentinel (Worker Proxy)
The `/api/proxy` endpoint acts as a privacy shield. It:
- Masks the client IP address from news publishers.
- Normalizes disparate RSS/Atom/JSON formats into a standard internal schema.
- Implements SHA-256 deduplication to prevent redundant processing.
### 2. Global Durable Object (The Consensus Hub)
A single global Durable Object manages the state of the regional mesh:
- **Node Registry**: Tracks active nodes and their public identity samples.
- **IQS Engine**: Calculates the Information Quality Score for every feed in the master list.
- **Telemetry Aggregation**: Anonymized usage statistics for network health monitoring.
### 3. Sentinel Rate-Limiting
To ensure fair use, the `v1` API implements a token-bucket rate limiter. If a node exceeds 100 requests per minute, the Sentinel issues a `429 Too Many Requests` response with a `Retry-After` header.