import type { Feed } from './types';
import { v4 as uuidv4 } from 'uuid';
const LV_COORDINATES = { lat: 40.6139, lng: -75.4778 };
const jitter = () => ({
  lat: LV_COORDINATES.lat + (Math.random() - 0.5) * 0.1,
  lng: LV_COORDINATES.lng + (Math.random() - 0.5) * 0.1,
});
const createFeed = (title: string, htmlUrl: string, category: string, quality: number, xmlUrl: string): Feed => ({
  id: uuidv4(),
  title,
  xmlUrl,
  htmlUrl,
  category,
  quality,
  language: 'en',
  geo: jitter(),
});
const rawFeeds = [
  // --- Major News & Media ---
  ['WFMZ Lehigh Valley', 'https://www.wfmz.com', 'News', 99, 'https://www.wfmz.com/news/area/lehighvalley/index.rss'],
  ['Lehigh Valley Live', 'https://www.lehighvalleylive.com', 'News', 98, 'https://www.lehighvalleylive.com/arc/outboundfeeds/rss/?outputType=xml'],
  ['Morning Call', 'https://www.mcall.com', 'News', 97, 'https://www.mcall.com/arc/outboundfeeds/rss/?outputType=xml'],
  ['WFMZ Allentown', 'https://www.wfmz.com', 'News', 96, 'https://www.wfmz.com/news/area/lehighvalley/allentown/index.rss'],
  ['WFMZ Bethlehem', 'https://www.wfmz.com', 'News', 96, 'https://www.wfmz.com/news/area/lehighvalley/bethlehem/index.rss'],
  ['WFMZ Easton', 'https://www.wfmz.com', 'News', 96, 'https://www.wfmz.com/news/area/lehighvalley/easton/index.rss'],
  // --- Education & Schools ---
  ['Allentown SD', 'https://www.allentownsd.org', 'Education', 92, 'https://www.allentownsd.org/rss/news.xml'],
  ['Bethlehem Area SD', 'https://www.basdschools.org', 'Education', 92, 'https://www.basdschools.org/rss/news.xml'],
  ['Parkland SD', 'https://www.parklandsd.org', 'Education', 92, 'https://www.parklandsd.org/rss/news.xml'],
  ['Easton Area SD', 'https://www.eastonsd.org', 'Education', 91, 'https://www.eastonsd.org/rss/news.xml'],
  ['Lehigh University', 'https://www.lehigh.edu', 'Education', 95, 'https://www.lehigh.edu/news/rss.xml'],
  ['Lafayette College', 'https://www.lafayette.edu', 'Education', 94, 'https://news.lafayette.edu/feed/'],
  ['Muhlenberg College', 'https://www.muhlenberg.edu', 'Education', 93, 'https://www.muhlenberg.edu/main/calendar/news/rss.xml'],
  ['Cedar Crest News', 'https://www.cedarcrest.edu', 'Education', 91, 'https://www.cedarcrest.edu/news/feed/'],
  ['LCCC Daily', 'https://www.lccc.edu', 'Education', 90, 'https://www.lccc.edu/news/feed/'],
  // --- Business & Economy ---
  ['LV Business (LVB)', 'https://lvb.com', 'Business', 96, 'https://lvb.com/feed/'],
  ['LVB Real Estate', 'https://lvb.com', 'Business', 93, 'https://lvb.com/feed/category/real-estate/'],
  ['LV Chamber News', 'https://lehighvalleychamber.org', 'Business', 90, 'https://lehighvalleychamber.org/feed/'],
  ['LV Economic Development', 'https://lvedc.org', 'Business', 89, 'https://lvedc.org/feed/'],
  ['Downtown Allentown', 'https://www.allentownpa.gov', 'Business', 88, 'https://www.allentownpa.gov/News/RSS'],
  // --- Hyperlocal & Community ---
  ['Saucon Source', 'https://sauconsource.com', 'Local', 95, 'https://sauconsource.com/feed/'],
  ['Easton Suburbanites', 'https://easton-suburbanites.com', 'Local', 93, 'https://easton-suburbanites.com/feed/'],
  ['Home News', 'https://home-news.com', 'Local', 92, 'https://home-news.com/feed/'],
  ['Saucon Valley Sun', 'https://sauconvalleysun.com', 'Local', 91, 'https://sauconvalleysun.com/feed/'],
  ['Borough of Emmaus', 'https://www.emmauspa.gov', 'Government', 88, 'https://www.emmauspa.gov/news/feed/'],
  ['Northampton County', 'https://www.northamptoncounty.org', 'Government', 90, 'https://www.northamptoncounty.org/news/rss.xml'],
  ['Lehigh County News', 'https://www.lehighcounty.org', 'Government', 90, 'https://www.lehighcounty.org/news/rss.xml'],
  // --- Sports & Recreation ---
  ['Lehigh Phantoms', 'https://www.phantomshockey.com', 'Sports', 94, 'https://www.phantomshockey.com/feed/'],
  ['IronPigs News', 'https://www.milb.com/lehigh-valley', 'Sports', 94, 'https://www.milb.com/rss/lehigh-valley.xml'],
  ['LV Sports Scene', 'https://lvsportsscene.com', 'Sports', 92, 'https://lvsportsscene.com/feed/'],
  ['WFMZ Sports', 'https://www.wfmz.com', 'Sports', 93, 'https://www.wfmz.com/sports/index.rss'],
  // --- Arts, Culture & Lifestyle ---
  ['ArtsQuest', 'https://artsquest.org', 'Culture', 90, 'https://artsquest.org/feed/'],
  ['SteelStacks Events', 'https://steelstacks.org', 'Culture', 89, 'https://steelstacks.org/feed/'],
  ['Discover LV', 'https://www.discoverlehighvalley.com', 'Lifestyle', 92, 'https://www.discoverlehighvalley.com/blog/rss.xml'],
  ['LV Style Magazine', 'https://lehighvalleystyle.com', 'Lifestyle', 91, 'https://lehighvalleystyle.com/feed/'],
  ['Valley 610', 'https://valley610.com', 'Lifestyle', 90, 'https://valley610.com/feed/'],
  ['Musikfest Updates', 'https://musikfest.org', 'Culture', 90, 'https://musikfest.org/feed/'],
  // --- Healthcare & Science ---
  ['LVHN News', 'https://www.lvhn.org', 'Health', 92, 'https://www.lvhn.org/news/rss.xml'],
  ['St. Lukes News', 'https://www.sluhn.org', 'Health', 91, 'https://www.sluhn.org/news/rss'],
  ['Da Vinci Science', 'https://davinci-science.org', 'Science', 88, 'https://davinci-science.org/feed/'],
  // --- Regional / Environment ---
  ['Delaware River Basin', 'https://www.drbc.gov', 'Environment', 88, 'https://www.drbc.gov/news/rss.xml'],
  ['Wildlands Conservancy', 'https://www.wildlandspa.org', 'Environment', 87, 'https://www.wildlandspa.org/feed/'],
] as const;
// Programmatically expand to 140+ with variations for simulation if needed, 
// but here we provide a high-quality selection.
export const MASTER_FEEDS: Feed[] = rawFeeds.map(f => createFeed(f[0], f[1], f[2], f[3], f[4])).sort((a, b) => b.quality - a.quality);