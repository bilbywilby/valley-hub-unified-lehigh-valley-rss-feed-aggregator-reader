import { Hono } from "hono";
import { Env } from './core-utils';
import type { Article, Feed } from '@shared/types';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    const getStub = (c: any) => c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
    // Rate Limiting Middleware for v1 API
    app.use('/api/v1/*', async (c, next) => {
        const ip = c.req.header('cf-connecting-ip') || 'anonymous';
        const stub = getStub(c);
        const { exceeded, retryAfter } = await stub.checkRateLimit(ip, 100, 60); // 100 req per min
        if (exceeded) {
            return c.json({ 
                success: false, 
                error: 'Too Many Requests',
                retryAfter 
            }, 429, { 'Retry-After': retryAfter.toString() });
        }
        await next();
    });
    // Network Sentinel Endpoints
    app.get('/api/v1/sentinel', (c) => c.json({ success: true, status: 'online', monitor: 'Network Sentinel v1' }));
    app.post('/api/v1/register-node', async (c) => {
        const body = await c.req.json();
        if (!body.nodeId) return c.json({ success: false, error: 'nodeId required' }, 400);
        await getStub(c).registerNode(body.nodeId, body.metadata || {});
        return c.json({ success: true });
    });
    app.get('/api/v1/discover', async (c) => {
        const data = await getStub(c).getDiscoverySample();
        return c.json({ success: true, data });
    });
    // Information Quality Index (IQS)
    app.post('/api/v1/iqs/:feedUrl', async (c) => {
        const feedUrl = decodeURIComponent(c.req.param('feedUrl'));
        const score = await getStub(c).calculateIQS(feedUrl);
        return c.json({ success: true, data: { quality: score } });
    });
    // Original Legacy Endpoints (v0)
    app.get('/api/articles', async (c) => {
        const data = await getStub(c).getArticles();
        return c.json({ success: true, data });
    });
    app.get('/api/feeds', async (c) => {
        const data = await getStub(c).getFeeds();
        return c.json({ success: true, data });
    });
    app.post('/api/signal/ingest', async (c) => {
        const articles = await c.req.json() as Article[];
        await getStub(c).ingestBatch(articles);
        return c.json({ success: true });
    });
    app.post('/api/signal/vote', async (c) => {
        const { feedUrl, score } = await c.req.json();
        const nodeId = c.req.header('x-node-id');
        if (!nodeId) return c.json({ success: false, error: 'Node ID required' }, 401);
        await getStub(c).voteQuality(feedUrl, score);
        return c.json({ success: true });
    });
    app.get('/api/signal/stats/:feedUrl', async (c) => {
        const feedUrl = decodeURIComponent(c.req.param('feedUrl'));
        const stats = await getStub(c).getGlobalStats(feedUrl);
        return c.json({ success: true, data: stats });
    });
    app.get('/api/proxy', async (c) => {
        const url = c.req.query('url');
        if (!url) return c.json({ success: false, error: 'URL required' }, 400);
        try {
            const res = await fetch(url, { headers: { 'User-Agent': 'ValleyHub/1.0' } });
            return c.text(await res.text());
        } catch (err) {
            return c.json({ success: false, error: 'Fetch failed' }, 500);
        }
    });
    app.post('/api/telemetry', async (c) => {
        const body = await c.req.json();
        await getStub(c).recordTelemetryBatch(body.events);
        return c.json({ success: true });
    });
    app.get('/api/network/status', async (c) => {
        const stats = await getStub(c).getNetworkStats();
        return c.json({ success: true, data: stats });
    });
}