export interface DocMetadata {
  slug: string;
  title: string;
  description: string;
  category: 'General' | 'Technical' | 'Privacy' | 'Strategic';
  content: string;
}
export const DOCS_MAP: Record<string, DocMetadata> = {
  'home': {
    slug: 'home',
    title: 'Node Summary',
    description: 'Quickstart guide for node operators.',
    category: 'General',
    content: `# Valley Hub Node Summary\n\nWelcome to the **Valley Hub** documentation hub. Valley Hub is a unified Lehigh Valley RSS feed aggregator and reader designed for privacy, semantic density, and regional intelligence.\n\n## Quickstart Guide\n\n1. **Identity Generation**: Upon first launch, your browser generates a non-extractable ECDSA P-256 key pair.\n2. **Feed Management**: Navigate to the **Manage Feeds** section to load the Master List.\n3. **Synchronizing**: Use the **Update Feed** button on the Homepage.\n4. **Reading**: Articles are processed locally and stored in IndexedDB.`
  },
  'system-design': {
    slug: 'system-design',
    title: 'Mesh System Design',
    description: 'Technical overview of the backend architecture.',
    category: 'Technical',
    content: `# Regional Mesh System Design\n\nValley Hub utilizes a hybrid architecture combining client-side persistence with a Cloudflare Workers-based signaling and proxy layer.\n\n### Components\n- **Network Sentinel**: Privacy-shielding proxy with 5-minute cache headers.\n- **Durable Object**: Global consensus and IQS engine managing ephmeral node discovery.\n- **Rate Limiting**: Token-bucket protection on v1 API endpoints.`
  },
  'privacy-protocols': {
    slug: 'privacy-protocols',
    title: 'Privacy & Identity',
    description: 'Identity and location anonymization systems.',
    category: 'Privacy',
    content: `# Privacy & Identity Protocols\n\nValley Hub uses cryptographic identity and mathematical noise.\n\n- **ECDSA P-256**: Non-extractable identity.\n- **Geo-Jitter**: Poisson-disc anonymization for location privacy.\n- **SHA-256 Commitment**: Content deduplication without text logging.\n- **Ephemerality**: Discovery signals expire after 24h.`
  },
  'data-persistence': {
    slug: 'data-persistence',
    title: 'Local Persistence',
    description: 'IndexedDB schema and data pruning.',
    category: 'Technical',
    content: `# Local Data Persistence\n\nValley Hub treats IndexedDB as the source of truth.\n\n- **Dexie.js**: Schema-driven local database.\n- **Pruning**: Automatic cleanup of old articles (24h) and telemetry (48h).`
  },
  'intelligence-streams': {
    slug: 'intelligence-streams',
    title: 'Intelligence Streams',
    description: 'Aggregation strategy and IQS logic.',
    category: 'Strategic',
    content: `# Regional Intelligence Streams\n\nAggregation of 120+ verified Lehigh Valley sources.\n\n- **IQS**: Information Quality Score (Frequency, Latency, Density).\n- **Consensus**: Decentralized voting mechanism.`
  },
  'roadmap': {
    slug: 'roadmap',
    title: 'Implementation Roadmap',
    description: 'Future development plans.',
    category: 'Strategic',
    content: `# Implementation Roadmap\n\n- **Current**: Documentation & Mesh Resilience.\n- **Future**: P2P Mesh, Advanced RAG, and Sentiment Analysis.`
  },
  'release-notes': {
    slug: 'release-notes',
    title: 'System Release v1.0.0',
    description: 'Architecture, Features, and Deployment manifest.',
    category: 'Technical',
    content: `# Valley Hub v1.0.0 Manifest\n\nValley Hub is a modern RSS aggregator for the Lehigh Valley, built with a "Privacy-by-Default" architecture.\n\n### 🚀 Features\n- **Mesh Aggregator**: Unified feed from 140+ regional sources.\n- **Secure Identity**: ECDSA P-256 keys generated on-device; never leaves the browser.\n- **IQS Engine**: Algorithmic scoring of feed quality and density.\n- **Sentinel Proxy**: Privacy-preserving CORS bypass for RSS fetching.\n\n### 🏗️ Architecture\n- **Frontend**: React 18, Tailwind CSS v3, Framer Motion, and Dexie.js (IndexedDB).\n- **Backend**: Cloudflare Workers + Hono.\n- **State**: Global Durable Object for mesh signaling and consensus.\n\n### 📦 Deployment\nValley Hub is optimized for the **Bun + Wrangler** stack.\n\n\`\`\`bash\n# 1. Install dependencies\nbun install\n\n# 2. Local development\nbun run dev\n\n# 3. Production build\nbun run build\n\n# 4. Deploy to Cloudflare\nbun run deploy\n\`\`\`\n\n### 🛡️ Privacy Commitments\n- No centralized user tracking.\n- Local-first article storage.\n- Jittered telemetry coordinates.`
  }
};
export const DOCS_LIST = Object.values(DOCS_MAP);