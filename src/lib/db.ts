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
export class ValleyHubDB extends Dexie {
  articles!: Table<Article>;
  feeds!: Table<Feed>;
  identity!: Table<UserIdentity>;
  config!: Table<AppConfig>;
  constructor() {
    super('ValleyHubDB');
    this.version(1).stores({
      articles: 'id, hash, pubDate, feedUrl, category, isBookmarked',
      feeds: 'id, xmlUrl, category, quality',
      identity: '++id, nodeId',
      config: 'key'
    });
  }
}
export const db = new ValleyHubDB();