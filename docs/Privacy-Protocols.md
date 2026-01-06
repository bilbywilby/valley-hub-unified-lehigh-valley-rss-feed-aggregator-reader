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