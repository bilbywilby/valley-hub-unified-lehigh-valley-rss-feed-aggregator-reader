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
        const updated = [article, ...items].slice(0, 1000);
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
    // Telemetry & Network Stats
    async recordTelemetryBatch(events: any[]): Promise<void> {
        const date = new Date().toISOString().split('T')[0];
        const key = `telemetry_${date}`;
        const existing: any[] = (await this.ctx.storage.get(key)) || [];
        const updated = [...existing, ...events].slice(-2000); // Keep last 2k events per day
        await this.ctx.storage.put(key, updated);
    }
    async getNetworkStats(): Promise<any> {
        const nodes = await this.ctx.storage.list({ prefix: "node_" });
        const now = Date.now();
        let activeCount = 0;
        nodes.forEach((val: any) => {
            if (now - val.lastSeen < 3600000) activeCount++;
        });
        return {
            totalNodes: nodes.size,
            activeNodes: activeCount,
            timestamp: now
        };
    }
    // Signaling & Registry
    async registerNode(nodeId: string, metadata: any): Promise<void> {
        await this.ctx.storage.put(`node_${nodeId}`, { ...metadata, lastSeen: Date.now() });
    }
    async storeOffer(targetNodeId: string, offer: any): Promise<void> {
        await this.ctx.storage.put(`offer_${targetNodeId}`, { ...offer, createdAt: Date.now() });
    }
    async getOffer(targetNodeId: string): Promise<any> {
        const offer: any = await this.ctx.storage.get(`offer_${targetNodeId}`);
        if (offer && Date.now() - offer.createdAt > 300000) { // 5 min TTL
            await this.ctx.storage.delete(`offer_${targetNodeId}`);
            return null;
        }
        return offer;
    }
}