export interface Article {
  id: string;
  hash: string;
  pubDate: string;
  title: string;
  link: string;
  feedUrl: string;
  category: string;
  description: string;
  imageUrl?: string;
  sourceName: string;
  isBookmarked?: boolean;
}
export interface Feed {
  id: string;
  title: string;
  xmlUrl: string;
  htmlUrl: string;
  category: string;
  quality: number; // 0-100
  language: string;
  geo?: {
    lat: number;
    lng: number;
  };
  lastFetched?: string;
}
export interface DemoItem {
  id: string;
  name: string;
  value: number;
}
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}