import { DurableObject } from "cloudflare:workers";
import type { Article, Feed } from '@shared/types';
import { MOCK_ARTICLES, MOCK_FEEDS } from '@shared/mock-data';
export class GlobalDurableObject extends DurableObject {
    // Rate Limiting Logic
    async checkRateLimit(ip: string, limit: number, windowSeconds: number): Promise<{ exceeded: boolean; retryAfter: number }> {
        const now = Math.floor(Date.now() / 1000);
        const windowKey = `ratelimit_${ip}_${Math.floor(now / windowSeconds)}`;
        const count: number = (await this.ctx.storage.get(windowKey)) || 0;
        if (count >= limit) {
            const nextWindow = (Math.floor(now / windowSeconds) + 1) * windowSeconds;
            return { exceeded: true, retryAfter: nextWindow - now };
        }
        await this.ctx.storage.put(windowKey, count + 1);
        // Clean up old window keys could be handled by a periodic alarm, 
        // but for DO storage, we'll just set it.
        return { exceeded: false, retryAfter: 0 };
    }
    // Node Discovery & Mesh Registry
    async registerNode(nodeId: string, metadata: any): Promise<void> {
        await this.ctx.storage.put(`node_${nodeId}`, { 
            ...metadata, 
            nodeId,
            lastSeen: Date.now() 
        });
    }
    async getDiscoverySample(): Promise<{ activeCount: number; sample: string[] }> {
        const nodes = await this.ctx.storage.list({ prefix: "node_" });
        const now = Date.now();
        const activeNodeIds: string[] = [];
        nodes.forEach((val: any, key: string) => {
            if (now - val.lastSeen < 3600000) { // Active within last hour
                activeNodeIds.push(val.nodeId);
            }
        });
        // Random sample of 5
        const sample = activeNodeIds
            .sort(() => Math.random() - 0.5)
            .slice(0, 5);
        return {
            activeCount: activeNodeIds.length,
            sample
        };
    }
    // Information Quality Score (IQS) Calculation
    async calculateIQS(feedUrl: string): Promise<number> {
        const articles = await this.getArticles();
        const feedArticles = articles.filter(a => a.feedUrl === feedUrl);
        const now = Date.now();
        const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
        const sixHoursAgo = now - (6 * 60 * 60 * 1000);
        let score = 0;
        // 1. Frequency (40pts): >3 articles in 7 days
        const recentArticles = feedArticles.filter(a => new Date(a.pubDate).getTime() > oneWeekAgo);
        if (recentArticles.length > 3) score += 40;
        else if (recentArticles.length > 0) score += 20;
        // 2. Latency (30pts): Update within 6 hours
        const latestArticle = feedArticles.reduce((latest, current) => {
            const currentSec = new Date(current.pubDate).getTime();
            return currentSec > latest ? currentSec : latest;
        }, 0);
        if (latestArticle > sixHoursAgo) score += 30;
        // 3. Density (30pts): > average description length
        const avgDensity = await this.getGlobalAverageDensity();
        const feedDensity = feedArticles.length > 0 
            ? feedArticles.reduce((acc, a) => acc + (a.description?.length || 0), 0) / feedArticles.length 
            : 0;
        if (feedDensity > avgDensity) score += 30;
        else if (feedDensity > avgDensity * 0.5) score += 15;
        // Persist the computed quality
        const feeds = await this.getFeeds();
        const updatedFeeds = feeds.map(f => f.xmlUrl === feedUrl ? { ...f, quality: score } : f);
        await this.ctx.storage.put("feeds", updatedFeeds);
        return score;
    }
    async getGlobalAverageDensity(): Promise<number> {
        const articles = await this.getArticles();
        if (articles.length === 0) return 0;
        const total = articles.reduce((acc, a) => acc + (a.description?.length || 0), 0);
        return total / articles.length;
    }
    // Existing methods (preserved)
    async getArticles(): Promise<Article[]> {
        const items = await this.ctx.storage.get("articles");
        if (items) return items as Article[];
        await this.ctx.storage.put("articles", MOCK_ARTICLES);
        return MOCK_ARTICLES;
    }
    async ingestBatch(articles: Article[]): Promise<void> {
        const current = await this.getArticles();
        const currentHashes = new Set(current.map(a => a.hash));
        const newArticles = articles.filter(a => !currentHashes.has(a.hash));
        if (newArticles.length === 0) return;
        const updated = [...newArticles, ...current].slice(0, 1000);
        await this.ctx.storage.put("articles", updated);
    }
    async getFeeds(): Promise<Feed[]> {
        const items = await this.ctx.storage.get("feeds");
        if (items) return items as Feed[];
        await this.ctx.storage.put("feeds", MOCK_FEEDS);
        return MOCK_FEEDS;
    }
    async voteQuality(feedUrl: string, score: number): Promise<void> {
        const key = `votes_${feedUrl}`;
        const data: { total: number; count: number } = (await this.ctx.storage.get(key)) || { total: 0, count: 0 };
        data.total += score;
        data.count += 1;
        await this.ctx.storage.put(key, data);
    }
    async getGlobalStats(feedUrl: string): Promise<any> {
        const voteKey = `votes_${feedUrl}`;
        const voteData: { total: number; count: number } = (await this.ctx.storage.get(voteKey)) || { total: 0, count: 0 };
        const consensus = voteData.count > 0 ? Math.round(voteData.total / voteData.count) : null;
        return { consensusScore: consensus, totalVotes: voteData.count, lastUpdated: Date.now() };
    }
    async recordTelemetryBatch(events: any[]): Promise<void> {
        const date = new Date().toISOString().split('T')[0];
        const key = `telemetry_${date}`;
        const existing: any[] = (await this.ctx.storage.get(key)) || [];
        const updated = [...existing, ...events].slice(-2000);
        await this.ctx.storage.put(key, updated);
    }
    async getNetworkStats(): Promise<any> {
        const discovery = await this.getDiscoverySample();
        return {
            activeNodes: discovery.activeCount,
            timestamp: Date.now()
        };
    }
}