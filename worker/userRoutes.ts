import { Hono } from "hono";
import { Env } from './core-utils';
import type { Article } from '@shared/types';
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
    // Health Check - Enhanced with Engine and Region metadata
    app.get('/api/v1/health', (c) => {
        const cf = (c.req.raw as any).cf;
        return c.json({
            success: true,
            status: 'online',
            version: '1.4.0-v4',
            engine: 'Cloudflare_V8_Isolates',
            region: cf?.region || 'GLOBAL',
            colo: cf?.colo || 'UNKNOWN',
            timestamp: new Date().toISOString()
        });
    });
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
    // Mesh Signaling Reports
    app.get('/api/v1/mesh/reports', async (c) => {
        const reports = await getStub(c).getReports();
        return c.json({ success: true, data: reports });
    });
    app.post('/api/v1/mesh/reports', async (c) => {
        const { nodeId, report } = await c.req.json();
        if (!nodeId) return c.json({ success: false, error: 'nodeId required' }, 400);
        await getStub(c).saveReport(nodeId, report || {});
        return c.json({ success: true });
    });
    // Sentinel Proxy v2 - Optimized with 10-minute cache and scrubbed headers
    app.get('/api/v1/sentinel/proxy', async (c) => {
        const url = c.req.query('url');
        if(!url || !url.startsWith('http')) {
            return c.json({success:false, error:'Valid URL required'}, 400);
        }
        try {
            const scrubbedHeaders = new Headers();
            scrubbedHeaders.set('User-Agent', 'Valley-Hub-Sentinel/4.0 (Regional Mesh Node; Privacy-First)');
            scrubbedHeaders.set('Accept', 'application/rss+xml, application/atom+xml, text/xml, application/xml;q=0.9, */*;q=0.8');
            const res = await fetch(url, {
                headers: scrubbedHeaders,
                redirect: 'follow'
            });
            if(!res.ok) throw new Error(`Source Error: ${res.status}`);
            const responseHeaders = new Headers();
            responseHeaders.set('Cache-Control', 'public, s-maxage=600, max-age=600');
            responseHeaders.set('Access-Control-Allow-Origin', '*');
            responseHeaders.set('Content-Type', res.headers.get('Content-Type') || 'application/xml');
            return new Response(res.body, { status: res.status, headers: responseHeaders });
        } catch(err: any) {
            return c.json({ success: false, error: err.message }, 502);
        }
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
        try {
            const { feedUrl, score } = await c.req.json();
            const nodeId = c.req.header('x-node-id');
            if (!nodeId) return c.json({ success: false, error: 'Node ID required' }, 401);
            if (!feedUrl) return c.json({ success: false, error: 'Feed URL required' }, 400);
            const numericScore = Number(score);
            if (isNaN(numericScore)) return c.json({ success: false, error: 'Invalid score' }, 400);
            await getStub(c).voteQuality(feedUrl, numericScore);
            return c.json({ success: true });
        } catch (err: any) {
            console.error(`[SIGNAL_VOTE_ERROR] ${err.message}`);
            return c.json({ success: false, error: 'Internal Signal Failure' }, 500);
        }
    });
    app.get('/api/signal/stats/:feedUrl', async (c) => {
        const feedUrl = decodeURIComponent(c.req.param('feedUrl'));
        const stats = await getStub(c).getGlobalStats(feedUrl);
        return c.json({ success: true, data: stats });
    });
    app.post('/api/telemetry', async (c) => {
        const body = await c.req.json();
        await getStub(c).recordTelemetryBatch(body.events || []);
        return c.json({ success: true });
    });
    app.get('/api/network/status', async (c) => {
        const stats = await getStub(c).getNetworkStats();
        return c.json({ success: true, data: stats });
    });
}