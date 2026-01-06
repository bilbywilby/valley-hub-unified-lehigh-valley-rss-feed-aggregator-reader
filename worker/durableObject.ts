import { DurableObject } from "cloudflare:workers";
import type { Article, Feed } from '@shared/types';
import { MOCK_ARTICLES, MOCK_FEEDS } from '@shared/mock-data';
export interface MeshReport {
    nodeId: string;
    latency: number;
    peerCount: number;
    engineStatus: string;
    timestamp: number;
    protocolVersion: string;
}
export class GlobalDurableObject extends DurableObject {
    // Rate Limiting Logic
    async checkRateLimit(ip: string, limit: number, windowSeconds: number): Promise<{ exceeded: boolean; retryAfter: number }> {
        const now = Math.floor(Date.now() / 1000);
        const windowKey = `rl_v2_${ip}_${Math.floor(now / windowSeconds)}`;
        const count: number = (await this.ctx.storage.get(windowKey)) || 0;
        if (count >= limit) {
            const nextWindow = (Math.floor(now / windowSeconds) + 1) * windowSeconds;
            return { exceeded: true, retryAfter: nextWindow - now };
        }
        await this.ctx.storage.put(windowKey, count + 1);
        return { exceeded: false, retryAfter: 0 };
    }
    // Mesh Discovery & Signaling Evolution
    async announceNode(nodeId: string, metadata: { lat: number, lng: number }): Promise<void> {
        const key = `mesh_node_${nodeId}`;
        await this.ctx.storage.put(key, {
            nodeId,
            coords: metadata,
            lastSeen: Date.now(),
            protocol_version: 'v4'
        });
    }
    async getActiveNodes(): Promise<any[]> {
        const nodes = await this.ctx.storage.list({ prefix: "mesh_node_" });
        const now = Date.now();
        const active: any[] = [];
        const threshold = 15 * 60 * 1000; // 15 minutes
        nodes.forEach((val: any) => {
            if (now - val.lastSeen < threshold) {
                active.push(val);
            }
        });
        return active.sort((a, b) => b.lastSeen - a.lastSeen).slice(0, 20);
    }
    // New Signal Report Management
    async saveReport(nodeId: string, report: Partial<MeshReport>): Promise<void> {
        const timestamp = Date.now();
        const reportKey = `mesh_report_${timestamp}_${nodeId}`;
        const fullReport: MeshReport = {
            nodeId,
            latency: report.latency || 0,
            peerCount: report.peerCount || 0,
            engineStatus: report.engineStatus || 'STABLE',
            timestamp,
            protocolVersion: 'v4'
        };
        await this.ctx.storage.put(reportKey, fullReport);
        // Cleanup old reports (keep last 100 in storage for safety, though API returns 50)
        const allReports = await this.ctx.storage.list({ prefix: "mesh_report_" });
        if (allReports.size > 100) {
            const keysToDelete = Array.from(allReports.keys()).sort().slice(0, allReports.size - 100);
            await Promise.all(keysToDelete.map(k => this.ctx.storage.delete(k)));
        }
    }
    async getReports(): Promise<MeshReport[]> {
        const reportsMap = await this.ctx.storage.list<MeshReport>({ prefix: "mesh_report_", reverse: true, limit: 50 });
        return Array.from(reportsMap.values());
    }
    // Information Quality Score (IQS) Calculation
    async calculateIQS(feedUrl: string): Promise<number> {
        const articles = await this.getArticles();
        const feedArticles = articles.filter(a => a.feedUrl === feedUrl);
        const now = Date.now();
        const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
        const sixHoursAgo = now - (6 * 60 * 60 * 1000);
        let score = 0;
        const recentArticles = feedArticles.filter(a => new Date(a.pubDate).getTime() > oneWeekAgo);
        if (recentArticles.length > 3) score += 40;
        else if (recentArticles.length > 0) score += 20;
        const latestArticle = feedArticles.reduce((latest, current) => {
            const currentSec = new Date(current.pubDate).getTime();
            return currentSec > latest ? currentSec : latest;
        }, 0);
        if (latestArticle > sixHoursAgo) score += 30;
        const avgDensity = await this.getGlobalAverageDensity();
        const feedDensity = feedArticles.length > 0
            ? feedArticles.reduce((acc, a) => acc + (a.description?.length || 0), 0) / feedArticles.length
            : 0;
        if (feedDensity > avgDensity) score += 30;
        else if (feedDensity > avgDensity * 0.5) score += 15;
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
        const activeNodes = await this.getActiveNodes();
        const reports = await this.getReports();
        return {
            activeNodes: activeNodes.length,
            sample: activeNodes.map(n => n.nodeId).slice(0, 5),
            latestReports: reports.length,
            timestamp: Date.now()
        };
    }
}