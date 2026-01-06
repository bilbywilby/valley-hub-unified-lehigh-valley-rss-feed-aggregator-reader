import { Hono } from "hono";
import { Env } from './core-utils';
import type { Article, Feed } from '@shared/types';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    const getStub = (c: any) => c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
    // Sentinel v1 API Rate Limiting
    app.use('/api/v1/*', async (c, next) => {
        const ip = c.req.header('cf-connecting-ip') || 'anonymous';
        const stub = getStub(c);
        const { exceeded, retryAfter } = await stub.checkRateLimit(ip, 120, 60);
        if (exceeded) {
            return c.json({ success: false, error: 'Too Many Requests', retryAfter }, 429);
        }
        await next();
    });
    // Health Check
    app.get('/api/v1/health', (c) => c.json({ 
        success: true, 
        status: 'online', 
        version: '1.2.0',
        timestamp: new Date().toISOString() 
    }));
    // Discovery Evolution
    app.post('/api/v1/discover/announce', async (c) => {
        const { nodeId, coords } = await c.req.json();
        if (!nodeId) return c.json({ success: false, error: 'nodeId required' }, 400);
        await getStub(c).announceNode(nodeId, coords || { lat: 0, lng: 0 });
        return c.json({ success: true });
    });
    app.get('/api/v1/discover/nodes', async (c) => {
        const nodes = await getStub(c).getActiveNodes();
        return c.json({ success: true, data: nodes });
    });
    // Sentinel Proxy v2
    app.get('/api/v1/sentinel/proxy', async (c) => {
        const url = c.req.query('url');
        if(!url || !url.startsWith('http')) {
            return c.json({success:false, error:'Valid URL required'}, 400);
        }
        try {
            const res = await fetch(url, { 
                headers: { 'User-Agent': 'Valley-Hub-Sentinel/2.0' } 
            });
            if(!res.ok) throw new Error(`Source Error: ${res.status}`);
            const headers = new Headers(res.headers);
            headers.set('Cache-Control', 'public, s-maxage=300, max-age=300'); // 5-minute cache
            headers.set('Access-Control-Allow-Origin', '*');
            return new Response(res.body, { status: res.status, headers });
        } catch(err: any) {
            return c.json({ success: false, error: err.message }, 502);
        }
    });
    // Support Legacy Path for compatibility
    app.get('/api/proxy', (c) => {
        const url = c.req.query('url');
        return c.redirect(`/api/v1/sentinel/proxy?url=${encodeURIComponent(url || '')}`);
    });
    // IQS & Signaling
    app.post('/api/v1/iqs/:feedUrl', async (c) => {
        const feedUrl = decodeURIComponent(c.req.param('feedUrl'));
        const score = await getStub(c).calculateIQS(feedUrl);
        return c.json({ success: true, data: { quality: score } });
    });
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