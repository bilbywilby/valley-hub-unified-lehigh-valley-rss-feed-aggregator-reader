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
    app.use('/api/proxy', async (c, next) => {
        const ip = c.req.header('cf-connecting-ip') || 'anonymous';
        const stub = getStub(c);
        const { exceeded, retryAfter } = await stub.checkRateLimit(ip, 100, 60);
        if (exceeded) {
            return c.json({
                success: false,
                error: 'Too Many Requests',
                retryAfter
            }, 429, { 'Retry-After': retryAfter.toString() });
        }
        await next();
    });

    app.get('/api/proxy', async (c) => {
        const url = c.req.query('url');
        if(!url || !url.startsWith('http')) {
            return c.json({success:false, error:'Valid URL query param required'},400);
        }
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        try {
            const res = await fetch(url, { signal: controller.signal, headers:{'User-Agent':'ValleyHub-RSS-Proxy/1.0 (+https://valleyhub.app)'} });
            clearTimeout(timeoutId);
            if(!res.ok) {
                return new Response(`RSS Proxy Error: ${res.status} ${res.statusText}`, {
                    status:502,
                    headers:{'Content-Type':'text/plain'}
                });
            }
            const ct = res.headers.get('content-type') || '';
            if (!ct.match(/xml|rss/i)) {
                throw new Error(`Invalid Content-Type: ${ct}`);
            }
            const headers = new Headers(res.headers);
            headers.delete('content-length');
            headers.delete('content-encoding');
            headers.set('Cache-Control','public, max-age=900, s-maxage=900');
            headers.set('Access-Control-Allow-Origin','*');
            headers.set('X-Proxy-Source',url);
            return new Response(res.body!, {status: res.status, headers});
        } catch(err:any) {
            clearTimeout(timeoutId);
            return new Response(`Proxy Error: ${err.message}`, {status: 502, headers: {'Content-Type': 'text/plain'}});
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