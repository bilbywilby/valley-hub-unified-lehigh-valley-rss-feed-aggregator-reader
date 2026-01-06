import { DurableObject } from "cloudflare:workers";
import type { Article, Feed, DemoItem } from '@shared/types';
import { MOCK_ARTICLES, MOCK_FEEDS } from '@shared/mock-data';
export class GlobalDurableObject extends DurableObject {
    // Article Management
    async getArticles(): Promise<Article[]> {
        const items = await this.ctx.storage.get("articles");
        if (items) return items as Article[];
        await this.ctx.storage.put("articles", MOCK_ARTICLES);
        return MOCK_ARTICLES;
    }
    async addArticle(article: Article): Promise<Article[]> {
        const items = await this.getArticles();
        const updated = [article, ...items].slice(0, 1000); // Keep last 1000
        await this.ctx.storage.put("articles", updated);
        return updated;
    }
    // Feed Management
    async getFeeds(): Promise<Feed[]> {
        const items = await this.ctx.storage.get("feeds");
        if (items) return items as Feed[];
        await this.ctx.storage.put("feeds", MOCK_FEEDS);
        return MOCK_FEEDS;
    }
    async addFeed(feed: Feed): Promise<Feed[]> {
        const items = await this.getFeeds();
        const updated = [...items, feed];
        await this.ctx.storage.put("feeds", updated);
        return updated;
    }
    async deleteFeed(id: string): Promise<Feed[]> {
        const items = await this.getFeeds();
        const updated = items.filter(f => f.id !== id);
        await this.ctx.storage.put("feeds", updated);
        return updated;
    }
    // Signaling & Registry
    async registerNode(nodeId: string, metadata: any): Promise<void> {
        await this.ctx.storage.put(`node_${nodeId}`, { ...metadata, lastSeen: Date.now() });
    }
    async storeOffer(targetNodeId: string, offer: any): Promise<void> {
        await this.ctx.storage.put(`offer_${targetNodeId}`, offer);
    }
    async getOffer(targetNodeId: string): Promise<any> {
        return await this.ctx.storage.get(`offer_${targetNodeId}`);
    }
    // Legacy/Demo Support
    async getCounterValue(): Promise<number> {
      return (await this.ctx.storage.get("counter_value")) || 0;
    }
    async increment(amount = 1): Promise<number> {
      let value: number = (await this.ctx.storage.get("counter_value")) || 0;
      value += amount;
      await this.ctx.storage.put("counter_value", value);
      return value;
    }
    async getDemoItems(): Promise<DemoItem[]> {
      const items = await this.ctx.storage.get("demo_items");
      return (items as DemoItem[]) || [];
    }
}