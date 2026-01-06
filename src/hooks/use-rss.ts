import { useState, useRef, useCallback } from 'react';
import { XMLParser } from 'fast-xml-parser';
import { db } from '@/lib/db';
import type { Article, Feed } from '@shared/types';
import { v4 as uuidv4 } from 'uuid';
import { MASTER_FEEDS } from '@shared/master-feeds';
export function useRSS() {
  const [isSyncing, setIsSyncing] = useState(false);
  const lastSyncRef = useRef<number>(0);
  const [error, setError] = useState<string | null>(null);
  const generateSafeHash = async (input: string): Promise<string> => {
    const msgUint8 = new TextEncoder().encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
  };
  const syncFeeds = useCallback(async (force: boolean = false) => {
    if (!navigator.onLine) {
      setError('Offline: Connect to synchronize regional mesh');
      return;
    }
    setIsSyncing(true);
    setError(null);
    const discoveredArticles: Article[] = [];
    try {
      let feeds = await db.feeds.toArray();
      const identity = await db.identity.toCollection().first();
      // Population phase if empty
      if (feeds.length === 0) {
        console.log('Initializing regional master feeds...');
        const initialFeeds = MASTER_FEEDS.map(f => ({ ...f, lastFetched: undefined }));
        await db.feeds.bulkAdd(initialFeeds);
        feeds = await db.feeds.toArray();
      }
      // Minimum sync interval check (except for first run or forced)
      const now = Date.now();
      if (!force && lastSyncRef.current !== 0 && now - lastSyncRef.current < 30000) {
        setError('Sync cooldown 30s');
        setIsSyncing(false);
        return;
      }
      lastSyncRef.current = now;
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
      });
      // Strategy: Prioritize high-quality feeds or those never fetched, unless forced
      const feedsToSync = force ? feeds.filter(feed => feed.quality > 50 && (!feed.lastFailed || (!isNaN(new Date(feed.lastFailed).getTime()) && now - new Date(feed.lastFailed).getTime() >= 86400000))) : feeds.filter(feed => { if(feed.quality <= 50) return false; if(feed.lastFailed && !isNaN(new Date(feed.lastFailed).getTime()) && (now - new Date(feed.lastFailed).getTime() < 86400000)) return false; if(!feed.lastFetched) return true; const lastFetchedTime = feed.lastFetched && !isNaN(new Date(feed.lastFetched).getTime()) ? new Date(feed.lastFetched).getTime() : 0; const timeSinceLastFetch = now - lastFetchedTime; const threshold = feed.quality > 80 ? 3600000 : 21600000; return timeSinceLastFetch > threshold; });
      const batch = feedsToSync.slice(0, force ? 30 : 20);
      for (const feed of batch) {
        try {
          const response = await fetch(`/api/v1/sentinel/proxy?url=${encodeURIComponent(feed.xmlUrl)}`);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const xmlText = await response.text();
          const jsonObj = parser.parse(xmlText);
          const channel = jsonObj.rss?.channel;
          const atomFeed = jsonObj.feed;
          const items = channel?.item || atomFeed?.entry || [];
          const normalizedItems = await Promise.all((Array.isArray(items) ? items : [items]).map(async (item: any) => {
            const title = item.title?.["#text"] || item.title || 'No title';
            let link = "";
            if (typeof item.link === 'string') link = item.link;
            else if (Array.isArray(item.link)) {
              const alternate = item.link.find((l: any) => l["@_rel"] === "alternate") || item.link[0];
              link = alternate["@_href"] || alternate;
            } else if (item.link?.["@_href"]) {
              link = item.link["@_href"];
            }
            const description = item.description || item.summary?.["#text"] || item.summary || item.content?.["#text"] || item.content || '';
            let pubDate = new Date().toISOString();
            const rawDate = item.pubDate || item.published || item.updated;
            if (rawDate) {
              const parsed = new Date(rawDate);
              if (!isNaN(parsed.getTime())) pubDate = parsed.toISOString();
            }
            const hash = await generateSafeHash(title + link);
            return {
              id: uuidv4(),
              hash,
              title: String(title),
              link: String(link),
              description: typeof description === 'string' ? description : (description?.["#text"] || ''),
              pubDate,
              feedUrl: feed.xmlUrl,
              category: feed.category,
              sourceName: feed.title,
              isBookmarked: false,
            } as Article;
          }));
          for (const article of normalizedItems) {
            const existing = await db.articles.where('hash').equals(article.hash).first();
            if (!existing) {
              await db.articles.add(article);
              discoveredArticles.push(article);
            }
          }
          if (normalizedItems.length > 0 && feed.id) {
            await db.feeds.update(feed.id, {
              quality: Math.min(100, (feed.quality || 0) + 2),
              lastFetched: new Date().toISOString(),
              successCount: (feed.successCount || 0) + 1
            });
          } else if (feed.id) {
            await db.feeds.update(feed.id, {
              quality: Math.max(0, (feed.quality || 0) - 1),
              lastFetched: new Date().toISOString()
            });
          }
          if (identity) {
            fetch(`/api/v1/iqs/${encodeURIComponent(feed.xmlUrl)}`, {
              method: 'POST',
              headers: { 'x-node-id': identity.nodeId }
            }).catch(() => {});
          }
        } catch (e) {
          console.debug(`Feed failed ${feed.title}: ${e.message}`);
          if (feed.id) {
            const newQuality = Math.max(0, (feed.quality || 0) - 10);
            await db.feeds.update(feed.id, {
              quality: newQuality,
              lastFailed: new Date().toISOString(),
              failCount: (feed.failCount || 0) + 1
            });
          }
        }
        await new Promise(r => setTimeout(r, 50)); // Faster spacing for UX
      }
      if (discoveredArticles.length > 0 && identity) {
        await fetch('/api/signal/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-node-id': identity.nodeId },
          body: JSON.stringify(discoveredArticles.slice(0, 50))
        }).catch(() => {});
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Mesh synchronization failed');
    } finally {
      setIsSyncing(false);
    }
  }, []);
  return { syncFeeds, isSyncing, error };
}