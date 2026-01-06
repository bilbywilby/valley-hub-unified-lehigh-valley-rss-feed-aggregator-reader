import { useState } from 'react';
import { XMLParser } from 'fast-xml-parser';
import { db } from '@/lib/db';
import type { Article, Feed } from '@shared/types';
import { v4 as uuidv4 } from 'uuid';
export function useRSS() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const syncFeeds = async () => {
    setIsSyncing(true);
    setError(null);
    try {
      const feeds = await db.feeds.toArray();
      if (feeds.length === 0) return;

      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
      });
      for (const feed of feeds) {
        try {
          const response = await fetch(`/api/proxy?url=${encodeURIComponent(feed.xmlUrl)}`);
          const xmlText = await response.text();
          const jsonObj = parser.parse(xmlText);
          const items = jsonObj.rss?.channel?.item || jsonObj.feed?.entry || [];
          const normalizedItems = (Array.isArray(items) ? items : [items]).map((item: any) => {
            const title = item.title || '';
            const link = item.link?.['@_href'] || item.link || '';
            const description = item.description || item.summary || item.content || '';
            const pubDate = item.pubDate || item.published || item.updated || new Date().toISOString();
            // Basic hash for deduplication
            const hash = btoa(title + link).substring(0, 32);
            return {
              id: uuidv4(),
              hash,
              title,
              link,
              description: typeof description === 'string' ? description : '',
              pubDate: new Date(pubDate).toISOString(),
              feedUrl: feed.id,
              category: feed.category,
              sourceName: feed.title,
              isBookmarked: false,
            } as Article;
          });
          // Deduplicate and bulk add
          for (const article of normalizedItems) {
            const existing = await db.articles.where('hash').equals(article.hash).first();
            if (!existing) {
              await db.articles.add(article);
            }
          }
          await db.feeds.update(feed.id, { lastFetched: new Date().toISOString() });
        } catch (e) {
          console.error(`Failed to fetch feed ${feed.title}:`, e);
        }
        // Small breather to keep UI responsive during massive sync
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown sync error');
    } finally {
      setIsSyncing(false);
    }
  };
  return { syncFeeds, isSyncing, error };
}