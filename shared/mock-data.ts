import type { Article, Feed } from './types';
import { MASTER_FEEDS } from './master-feeds';
export const MOCK_FEEDS: Feed[] = MASTER_FEEDS.slice(0, 10);
export const MOCK_ARTICLES: Article[] = [
  {
    id: 'a1',
    hash: 'h1',
    pubDate: new Date().toISOString(),
    title: 'Historic Restoration of Allentown Main Street Underway',
    link: 'https://example.com/allentown-restoration',
    feedUrl: MOCK_FEEDS[0].id,
    category: 'Local News',
    description: 'The city of Allentown has begun a massive multi-year project to restore the historic facades along Hamilton Street.',
    imageUrl: 'https://images.unsplash.com/photo-1541467522944-75065418330c?auto=format&fit=crop&q=80&w=1000',
    sourceName: 'Lehigh Valley Live'
  },
  {
    id: 'a2',
    hash: 'h2',
    pubDate: new Date(Date.now() - 3600000).toISOString(),
    title: 'New Technology Hub Opens in Bethlehem’s South Side',
    link: 'https://example.com/bethlehem-tech',
    feedUrl: MOCK_FEEDS[1].id,
    category: 'Business',
    description: 'Bethlehem continues its transformation from steel city to tech center with the opening of a new incubator.',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000',
    sourceName: 'Morning Call'
  }
];