import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, Bookmark, Share2, Clock, Globe, RefreshCcw, Rss, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { getOrCreateIdentity } from '@/lib/identity';
import { useRSS } from '@/hooks/use-rss';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import type { Article } from '@shared/types';
import { formatDistanceToNow } from 'date-fns';
export function HomePage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const articles = useLiveQuery(() => db.articles.orderBy('pubDate').reverse().limit(200).toArray());
  const feedsCount = useLiveQuery(() => db.feeds.count()) ?? 0;
  const { syncFeeds, isSyncing } = useRSS();
  useEffect(() => {
    getOrCreateIdentity();
  }, []);
  const filteredArticles = useMemo(() => {
    if (!articles) return [];
    if (!searchQuery) return articles;
    const lowerQuery = searchQuery.toLowerCase();
    return articles.filter(a =>
      a.title.toLowerCase().includes(lowerQuery) ||
      a.sourceName.toLowerCase().includes(lowerQuery)
    );
  }, [articles, searchQuery]);
  return (
    <AppLayout container={true}>
      <div className="space-y-12">
        {/* Hero Section */}
        <section className="relative rounded-4xl overflow-hidden bg-gradient-mesh p-8 md:p-12 lg:p-20 shadow-soft">
          <div className="relative z-10 max-w-3xl space-y-6">
            <Badge className="bg-white/20 text-white backdrop-blur-md border-none px-4 py-1">
              What's New in Lehigh Valley
            </Badge>
            <h1 className="text-5xl md:text-6xl font-display font-extrabold text-white leading-tight">
              Local News, <span className="text-black/10 font-bold">Redefined</span>
            </h1>
            <p className="text-lg text-white/90 font-medium max-w-xl text-pretty">
              Aggregated, curated, and privacy-focused news from across the region.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button
                onClick={() => syncFeeds()}
                disabled={isSyncing}
                size="lg"
                className="bg-white text-brand-orange hover:bg-brand-orange hover:text-white border-none shadow-lg transition-all"
              >
                {isSyncing ? <RefreshCcw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                Refresh Feed
              </Button>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
            <Newspaper className="w-80 h-80 -mr-12 -mb-12 rotate-12" />
          </div>
        </section>
        {/* Search & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search local stories..."
              className="pl-10 bg-card border-none shadow-soft h-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-card shadow-soft border-none h-11 px-6 font-medium">Latest</Button>
            <Button variant="ghost" size="sm" className="h-11 px-6 font-medium">Trending</Button>
          </div>
        </div>
        {/* Article Grid */}
        {!articles || filteredArticles.length === 0 ? (
          <div className="py-24 text-center space-y-6 bg-muted/20 rounded-4xl border border-dashed border-muted">
            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Rss className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">No articles found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {feedsCount === 0 ? "Add some feeds in Feed Management to get started." : "Try adjusting your search or hit refresh for latest updates."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredArticles.map((article, index) => (
              <ArticleCard key={article.id} article={article} index={index} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
function ArticleCard({ article, index }: { article: Article; index: number }) {
  const timeAgo = useMemo(() => {
    try {
      if (!article.pubDate) return "recently";
      const date = new Date(article.pubDate);
      if (isNaN(date.getTime())) return "recently";
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return "recently";
    }
  }, [article.pubDate]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.5 }}
    >
      <Link to={`/article/${article.id}`}>
        <Card className="h-full flex flex-col group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-none bg-card shadow-soft overflow-hidden">
          <div className="aspect-[16/10] relative overflow-hidden bg-muted">
            {article.imageUrl ? (
              <img
                src={article.imageUrl}
                alt={article.title}
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-brand-orange/5 to-brand-red-orange/15 flex items-center justify-center p-6 text-center">
                 <Newspaper className="h-12 w-12 text-brand-orange/10 group-hover:scale-110 transition-transform duration-500" />
              </div>
            )}
            <Badge className="absolute top-3 left-3 bg-brand-orange/90 text-white backdrop-blur-sm border-none shadow-sm hover:bg-brand-orange">
              {article.category || 'News'}
            </Badge>
          </div>
          <CardHeader className="p-5 pb-2">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-2 uppercase font-bold tracking-widest overflow-hidden">
              <Globe className="h-3 w-3 flex-shrink-0" />
              <span className="truncate max-w-[120px]">{article.sourceName}</span>
              <span className="flex-shrink-0">•</span>
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{timeAgo}</span>
            </div>
            <h3 className="text-lg font-bold leading-tight group-hover:text-brand-orange transition-colors line-clamp-2 min-h-[3rem]">
              {article.title}
            </h3>
          </CardHeader>
          <CardContent className="p-5 pt-0 flex-grow">
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {article.description?.replace(/<[^>]*>?/gm, '')}
            </p>
          </CardContent>
          <CardFooter className="p-5 pt-0 flex justify-between items-center border-t border-border/40 mt-auto">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-brand-orange hover:bg-brand-orange/10 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                db.articles.update(article.id, { isBookmarked: !article.isBookmarked });
              }}
            >
              <Bookmark className={`h-5 w-5 ${article.isBookmarked ? "fill-current text-brand-orange" : ""}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 text-muted-foreground hover:text-brand-orange hover:bg-brand-orange/10"
              onClick={(e) => { e.preventDefault(); /* implement share */ }}
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}