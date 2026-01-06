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
    this.on('versionchange', () => {
      console.warn('Another connection wants to upgrade the database. Closing now.');
      this.close();
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    });
  }
  /**
   * Clears all articles that are NOT bookmarked.
   */
  async clearNonBookmarkedArticles() {
    return this.transaction('rw', this.articles, async () => {
      const nonBookmarkedKeys = await this.articles
        .filter(article => !(article.isBookmarked ?? false))
        .primaryKeys();
      await this.articles.bulkDelete(nonBookmarkedKeys);
    });
  }
  /**
   * Prunes articles older than 24 hours (unless bookmarked)
   * and telemetry older than 48 hours if synced.
   */
  async pruneOldData() {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const twoDaysAgo = Date.now() - (48 * 60 * 60 * 1000);
    return this.transaction('rw', [this.articles, this.telemetry], async () => {
      // Prune old non-bookmarked articles
      const oldArticles = await this.articles
        .where('pubDate').below(new Date(oneDayAgo).toISOString())
        .filter(a => !(a.isBookmarked ?? false))
        .primaryKeys();
      await this.articles.bulkDelete(oldArticles);
      // Prune synced telemetry older than 48h
      const oldTelemetry = await this.telemetry
        .where('timestamp').below(twoDaysAgo)
        .filter(t => t.synced === 1)
        .primaryKeys();
      await this.telemetry.bulkDelete(oldTelemetry);
    });
  }
}
export const db = new ValleyHubDB();