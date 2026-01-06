import { Hono } from "hono";
import { Env } from './core-utils';
import type { Article, Feed } from '@shared/types';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    const getStub = (c: any) => c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
    // Articles & Feeds
    app.get('/api/articles', async (c) => {
        const data = await getStub(c).getArticles();
        return c.json({ success: true, data });
    });
    app.get('/api/feeds', async (c) => {
        const data = await getStub(c).getFeeds();
        return c.json({ success: true, data });
    });
    // Distributed Signaling
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
    // Core Proxy & Telemetry
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
    app.post('/api/register', async (c) => {
        const body = await c.req.json();
        await getStub(c).registerNode(body.nodeId, body.metadata);
        return c.json({ success: true });
    });
    app.get('/api/offer/:nodeId', async (c) => {
        const data = await getStub(c).getOffer(c.req.param('nodeId'));
        return c.json({ success: true, data });
    });
}