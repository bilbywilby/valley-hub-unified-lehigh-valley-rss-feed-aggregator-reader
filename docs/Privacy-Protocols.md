# Privacy & Identity Protocols
Valley Hub is built on the principle that "You are not the product." We use cryptographic identity and mathematical noise to ensure user privacy.
## Cryptographic Identity
Your `nodeId` is derived from a public JWK (JSON Web Key). 
- **Algorithm**: ECDSA P-256.
- **Security**: The private key is marked as `extractable: false`, meaning it cannot be stolen via XSS or exported from the browser's secure storage.
- **Derivation**: `SHA-256(PublicJWK) -> Base16[0..16]`.
## Geo-Jitter Anonymization
To prevent trajectory leakage or precise clustering of readers, Valley Hub applies a **Poisson-disc-like jitter** to all telemetry coordinates.
- **Mechanism**: Random noise up to ~500m is added to latitude/longitude.
- **Privacy Guarantee**: Provides "k-anonymity" within a local neighborhood, making it impossible to pin a signal to a specific street address while maintaining regional accuracy for news heatmaps.

## Technical Appendices
### SHA-256 Content Commitment
To maintain semantic density without global storage of PII, the mesh uses SHA-256 commitments for article deduplication. This allows nodes to verify if they have already processed a specific content segment without the Sentinel Proxy needing to retain cleartext logs of user reading habits.

### Ephemerality Protocols
Node discovery records stored in the Global Durable Object are strictly ephemeral. Any node signal not refreshed within **24 hours** is purged from the registry. Telemetry events are treated as volatile "fire-and-forget" signals that aggregated into hourly buckets before the raw signals are deleted.

### Jitter Offset Stability
While coordinates are jittered, the offset is derived from a per-session seed. This ensures that a node appears at a stable (but inaccurate) location during a single session, preventing "location flickering" that could be used for advanced triangulation via multi-sample averaging.