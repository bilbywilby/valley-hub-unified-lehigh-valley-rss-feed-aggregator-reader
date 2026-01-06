import Dexie, { type Table } from 'dexie';
import type { Article, Feed } from '@shared/types';
export interface AppConfig {
  key: string;
  value: any;
}
export interface UserIdentity {
  id?: number;
  nodeId: string;
  publicJwk: string;
  createdAt: number;
}
export interface TelemetryEvent {
  id?: number;
  event: string;
  payload: any;
  timestamp: number;
  synced: number; // 0 for no, 1 for yes
}
export interface UserSetting {
  key: string;
  value: any;
}
export interface VoteRecord {
  feedUrl: string;
  lastVoted: number;
  score: number;
}
export class ValleyHubDB extends Dexie {
  articles!: Table<Article>;
  feeds!: Table<Feed>;
  identity!: Table<UserIdentity>;
  config!: Table<AppConfig>;
  telemetry!: Table<TelemetryEvent>;
  settings!: Table<UserSetting>;
  votes!: Table<VoteRecord>;
  constructor() {
    super('ValleyHubDB');
    this.version(1).stores({
      articles: 'id, hash, pubDate, feedUrl, category, isBookmarked',
      feeds: 'id, xmlUrl, category, quality',
      identity: '++id, nodeId',
      config: 'key'
    });
    this.version(2).stores({
      telemetry: '++id, event, timestamp, synced',
      settings: 'key'
    });
    this.version(3).stores({
      votes: 'feedUrl, lastVoted'
    });
    // CRITICAL: Handle multi-tab schema upgrades gracefully
    this.on('versionchange', () => {
      console.warn('Another connection wants to upgrade the database. Closing now.');
      this.close();
      // Optional: reload to pick up new schema
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    });
  }
}
export const db = new ValleyHubDB();