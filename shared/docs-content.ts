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
    content: `# Regional Mesh System Design\n\nValley Hub utilizes a hybrid architecture combining client-side persistence with a Cloudflare Workers-based signaling and proxy layer.\n\n### Components\n- **Network Sentinel**: Privacy-shielding proxy.\n- **Durable Object**: Global consensus and IQS engine.\n- **Rate Limiting**: Protects the mesh from abuse.`
  },
  'privacy-protocols': {
    slug: 'privacy-protocols',
    title: 'Privacy & Identity',
    description: 'Identity and location anonymization systems.',
    category: 'Privacy',
    content: `# Privacy & Identity Protocols\n\nValley Hub uses cryptographic identity and mathematical noise.\n\n- **ECDSA P-256**: Non-extractable identity.\n- **Geo-Jitter**: Poisson-disc anonymization for location privacy.`
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
  }
};
export const DOCS_LIST = Object.values(DOCS_MAP);