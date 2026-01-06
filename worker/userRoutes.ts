import { Hono } from "hono";
import { Env } from './core-utils';
import type { Article, Feed, ApiResponse } from '@shared/types';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // Article Endpoints
    app.get('/api/articles', async (c) => {
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await stub.getArticles();
        return c.json({ success: true, data } satisfies ApiResponse<Article[]>);
    });
    // Feed Endpoints
    app.get('/api/feeds', async (c) => {
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await stub.getFeeds();
        return c.json({ success: true, data } satisfies ApiResponse<Feed[]>);
    });
    app.post('/api/feeds', async (c) => {
        const feed = await c.req.json() as Feed;
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await stub.addFeed(feed);
        return c.json({ success: true, data } satisfies ApiResponse<Feed[]>);
    });
    // Proxy for RSS Fetching
    app.get('/api/proxy', async (c) => {
        const url = c.req.query('url');
        if (!url) return c.json({ success: false, error: 'URL is required' }, 400);
        try {
            const response = await fetch(url, {
                headers: { 'User-Agent': 'ValleyHub/1.0 RSS Aggregator' }
            });
            const text = await response.text();
            return c.text(text); // Frontend will parse XML
        } catch (err) {
            return c.json({ success: false, error: 'Failed to fetch RSS' }, 500);
        }
    });
    // Signaling Endpoints
    app.post('/api/register', async (c) => {
        const body = await c.req.json();
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        await stub.registerNode(body.nodeId, body.metadata);
        return c.json({ success: true });
    });
    app.get('/api/offer/:nodeId', async (c) => {
        const nodeId = c.req.param('nodeId');
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await stub.getOffer(nodeId);
        return c.json({ success: true, data });
    });
}