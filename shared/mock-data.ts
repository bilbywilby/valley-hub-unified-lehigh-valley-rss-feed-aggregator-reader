import type { Article, Feed } from './types';
export const MOCK_FEEDS: Feed[] = [
  {
    id: 'f1',
    title: 'Lehigh Valley News',
    xmlUrl: 'https://www.lehighvalleylive.com/arc/outboundfeeds/rss/?outputType=xml',
    htmlUrl: 'https://www.lehighvalleylive.com',
    category: 'News',
    quality: 95,
    language: 'en',
    lastFetched: new Date().toISOString()
  },
  {
    id: 'f2',
    title: 'Morning Call Local',
    xmlUrl: 'https://www.mcall.com/feed/',
    htmlUrl: 'https://www.mcall.com',
    category: 'News',
    quality: 88,
    language: 'en',
    lastFetched: new Date().toISOString()
  }
];
export const MOCK_ARTICLES: Article[] = [
  {
    id: 'a1',
    hash: 'h1',
    pubDate: new Date().toISOString(),
    title: 'Historic Restoration of Allentown Main Street Underway',
    link: 'https://example.com/allentown-restoration',
    feedUrl: 'f1',
    category: 'Local News',
    description: 'The city of Allentown has begun a massive multi-year project to restore the historic facades along Hamilton Street, bringing back 1920s elegance to the downtown corridor.',
    imageUrl: 'https://images.unsplash.com/photo-1541467522944-75065418330c?auto=format&fit=crop&q=80&w=1000',
    sourceName: 'Lehigh Valley Live'
  },
  {
    id: 'a2',
    hash: 'h2',
    pubDate: new Date(Date.now() - 3600000).toISOString(),
    title: 'New Technology Hub Opens in Bethlehem’s South Side',
    link: 'https://example.com/bethlehem-tech',
    feedUrl: 'f2',
    category: 'Business',
    description: 'Bethlehem continues its transformation from steel city to tech center with the opening of a new incubator targeting green energy startups.',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000',
    sourceName: 'Morning Call'
  },
  {
    id: 'a3',
    hash: 'h3',
    pubDate: new Date(Date.now() - 7200000).toISOString(),
    title: 'The Rise of Farm-to-Table in the Lehigh Valley',
    link: 'https://example.com/lv-food',
    feedUrl: 'f1',
    category: 'Lifestyle',
    description: 'Exploring how local farms are partnering with chefs in Easton to create one of the most vibrant culinary scenes in the Northeast.',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1000',
    sourceName: 'Lehigh Valley Live'
  },
  {
    id: 'a4',
    hash: 'h4',
    pubDate: new Date(Date.now() - 86400000).toISOString(),
    title: 'Easton’s Riverside Park Expansion Gains Approval',
    link: 'https://example.com/easton-park',
    feedUrl: 'f1',
    category: 'Local News',
    description: 'A multi-million dollar grant will fund the expansion of the walking trails along the Delaware river, connecting more neighborhoods to the waterfront.',
    imageUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=1000',
    sourceName: 'Lehigh Valley Live'
  }
];