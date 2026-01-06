import { Hono } from "hono";
import { Env } from './core-utils';
import type { Article, Feed } from '@shared/types';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // Utility for stub access
    const getStub = (c: any) => c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
    app.get('/api/articles', async (c) => {
        const data = await getStub(c).getArticles();
        return c.json({ success: true, data });
    });
    app.get('/api/feeds', async (c) => {
        const data = await getStub(c).getFeeds();
        return c.json({ success: true, data });
    });
    app.post('/api/feeds', async (c) => {
        const feed = await c.req.json() as Feed;
        const data = await getStub(c).addFeed(feed);
        return c.json({ success: true, data });
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