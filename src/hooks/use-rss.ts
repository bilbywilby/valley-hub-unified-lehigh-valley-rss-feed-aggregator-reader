import { useState } from 'react';
import { XMLParser } from 'fast-xml-parser';
import { db } from '@/lib/db';
import type { Article } from '@shared/types';
import { v4 as uuidv4 } from 'uuid';
/**
 * Generates a stable hash for a string without crashing on Unicode/Emoji
 */
async function generateSafeHash(input: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
}
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
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const xmlText = await response.text();
          const jsonObj = parser.parse(xmlText);
          // Handle both RSS 2.0 and Atom structures
          const channel = jsonObj.rss?.channel;
          const atomFeed = jsonObj.feed;
          const items = channel?.item || atomFeed?.entry || [];
          const normalizedItems = await Promise.all((Array.isArray(items) ? items : [items]).map(async (item: any) => {
            const title = item.title?.["#text"] || item.title || 'No title';
            // Link detection for Atom vs RSS
            let link = "";
            if (typeof item.link === 'string') link = item.link;
            else if (Array.isArray(item.link)) {
              const alternate = item.link.find((l: any) => l["@_rel"] === "alternate") || item.link[0];
              link = alternate["@_href"] || alternate;
            } else if (item.link?.["@_href"]) {
              link = item.link["@_href"];
            } else if (item.guid?.["#text"]) {
              link = item.guid["#text"];
            }
            const description = item.description || item.summary?.["#text"] || item.summary || item.content?.["#text"] || item.content || '';
            // Robust date parsing
            let pubDate = new Date().toISOString();
            const rawDate = item.pubDate || item.published || item.updated || item["dc:date"];
            if (rawDate) {
              const parsed = new Date(rawDate);
              if (!isNaN(parsed.getTime())) {
                pubDate = parsed.toISOString();
              }
            }
            const hash = await generateSafeHash(title + link);
            return {
              id: uuidv4(),
              hash,
              title: typeof title === 'string' ? title : String(title),
              link: typeof link === 'string' ? link : String(link),
              description: typeof description === 'string' ? description : (description?.["#text"] || ''),
              pubDate,
              feedUrl: feed.id,
              category: feed.category,
              sourceName: feed.title,
              isBookmarked: false,
            } as Article;
          }));
          // Bulk deduplication and storage
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