import React, { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, Bookmark, Share2, RefreshCcw, Rss, Search, Sparkles, Network } from 'lucide-react';
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
import { Progress } from '@/components/ui/progress';
import type { Article } from '@shared/types';
import { formatDistanceToNow } from 'date-fns';
export function HomePage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const articles = useLiveQuery(() => db.articles.orderBy('pubDate').reverse().limit(200).toArray());
  const feedsCount = useLiveQuery(() => db.feeds.count()) ?? 0;
  const { syncFeeds, isSyncing, error } = useRSS();
  const hasAttemptedAutoSync = useRef(false);
  useEffect(() => {
    getOrCreateIdentity().catch(console.error);
  }, []);
  // Auto-sync logic: If no articles exist, trigger ingestion immediately
  useEffect(() => {
    if (articles && articles.length === 0 && !isSyncing && !hasAttemptedAutoSync.current) {
      hasAttemptedAutoSync.current = true;
      syncFeeds();
    }
  }, [articles, isSyncing, syncFeeds]);
  const filteredArticles = useMemo(() => {
    if (!articles) return [];
    if (!searchQuery) return articles;
    const lowerQuery = searchQuery.toLowerCase();
    return articles.filter(a =>
      a.title.toLowerCase().includes(lowerQuery) ||
      a.sourceName.toLowerCase().includes(lowerQuery) ||
      a.category?.toLowerCase().includes(lowerQuery)
    );
  }, [articles, searchQuery]);
  return (
    <AppLayout container={true}>
      <div className="space-y-12">
        {/* Hero Section */}
        <section className="relative rounded-4xl overflow-hidden bg-surface-container-high p-8 md:p-12 lg:p-16 shadow-md3-2 border border-border/50">
          <div className="relative z-10 max-w-3xl space-y-6">
            <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 rounded-full font-bold tracking-tight">
              <Sparkles className="h-3 w-3 mr-2 inline" /> Regional Intelligence Mesh
            </Badge>
            <h1 className="text-5xl md:text-6xl font-display font-extrabold text-foreground leading-tight tracking-tight">
              Lehigh Valley, <span className="text-primary italic">Decentralized</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium max-w-xl text-pretty leading-relaxed">
              Experience the region's news through a privacy-preserving aggregator powered by local nodes.
            </p>
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex flex-wrap gap-4 items-center">
                <Button
                  onClick={() => syncFeeds()}
                  disabled={isSyncing}
                  size="lg"
                  className="rounded-full bg-primary text-primary-foreground hover:shadow-glow px-8 h-12 transition-all font-bold"
                >
                  {isSyncing ? <RefreshCcw className="mr-2 h-4 w-4 animate-spin" /> : <Network className="mr-2 h-4 w-4" />}
                  {isSyncing ? "Mesh Syncing..." : "Update Network"}
                </Button>
                {isSyncing && (
                  <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 animate-in fade-in zoom-in duration-300">
                    <span className="text-xs font-bold text-primary animate-pulse uppercase tracking-widest">Ingesting Feeds</span>
                  </div>
                )}
                {error && !isSyncing && (
                  <span className="text-xs font-bold text-destructive bg-destructive/10 px-4 py-2 rounded-full border border-destructive/20">
                    {error}
                  </span>
                )}
              </div>
              {isSyncing && (
                <div className="space-y-2 max-w-xs pt-2">
                  <Progress value={undefined} className="h-1 bg-primary/10" />
                  <p className="text-[10px] uppercase font-black tracking-widest text-primary/60">Reconciling master sources...</p>
                </div>
              )}
            </div>
          </div>
          <div className="absolute right-[-5%] bottom-[-10%] opacity-5 pointer-events-none select-none">
            <Rss className="w-96 h-96 text-primary rotate-12" />
          </div>
        </section>
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search regional mesh..."
              className="pl-12 bg-surface-container-low border-none shadow-md3-1 h-14 rounded-full text-base focus-visible:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0">
            <Button variant="outline" className="rounded-full border-none bg-surface-container h-12 px-6 font-bold shadow-md3-1 hover:shadow-md3-2">Latest</Button>
            <Button variant="ghost" className="rounded-full h-12 px-6 font-bold text-muted-foreground hover:text-primary">Bookmarks</Button>
          </div>
        </div>
        {/* Article Grid */}
        {!articles || filteredArticles.length === 0 ? (
          <div className="py-32 text-center space-y-6 bg-surface-container-low rounded-4xl border-2 border-dashed border-border/50 animate-fade-in">
            <div className="w-24 h-24 bg-surface-container-high rounded-full flex items-center justify-center mx-auto shadow-md3-1">
              {isSyncing ? (
                <RefreshCcw className="h-10 w-10 text-primary animate-spin" />
              ) : (
                <Newspaper className="h-10 w-10 text-primary/40" />
              )}
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold">{isSyncing ? "Bootstrapping Mesh" : "No articles found"}</h3>
              <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed font-medium">
                {isSyncing 
                  ? "We're currently populating your regional node. This will only take a moment." 
                  : feedsCount === 0 
                    ? "Your feed list is empty. Go to Manage Feeds to load the Lehigh Valley master list." 
                    : "No articles match your criteria. Try adjusting your search."}
              </p>
              {!isSyncing && feedsCount === 0 && (
                <Button asChild className="rounded-full px-8 mt-4 bg-primary">
                  <Link to="/feeds">Initialize Master Feeds</Link>
                </Button>
              )}
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.05, 0.5), duration: 0.5 }}
    >
      <Link to={`/article/${article.id}`}>
        <Card className="md3-card h-full flex flex-col group border-none shadow-md3-1 bg-surface-container-low hover:bg-surface-container">
          <div className="aspect-[16/10] relative overflow-hidden m-2 rounded-2xl bg-surface-container-high">
            {article.imageUrl ? (
              <img
                src={article.imageUrl}
                alt={article.title}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-primary/5 flex items-center justify-center p-6 text-center">
                 <Newspaper className="h-12 w-12 text-primary/10" />
              </div>
            )}
            <div className="absolute top-3 left-3">
              <Badge className="bg-primary/90 backdrop-blur-sm text-primary-foreground border-none rounded-lg shadow-lg font-bold text-[10px] uppercase tracking-wider">
                {article.category || 'Regional'}
              </Badge>
            </div>
          </div>
          <CardHeader className="px-5 pb-2 pt-3">
            <div className="flex items-center gap-2 text-[10px] text-primary font-black uppercase tracking-widest mb-2 opacity-80">
              <span className="truncate max-w-[120px]">{article.sourceName}</span>
              <span className="text-muted-foreground font-normal opacity-50">•</span>
              <span className="truncate text-muted-foreground font-semibold">{timeAgo}</span>
            </div>
            <h3 className="text-lg font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
              {article.title}
            </h3>
          </CardHeader>
          <CardContent className="px-5 pt-0 flex-grow">
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed opacity-90">
              {article.description?.replace(/<[^>]*>?/gm, '')}
            </p>
          </CardContent>
          <CardFooter className="px-5 py-4 pt-0 flex justify-between items-center mt-auto">
            <div className="flex gap-1">
               <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                onClick={(e) => {
                  e.preventDefault();
                  db.articles.update(article.id, { isBookmarked: !article.isBookmarked });
                }}
              >
                <Bookmark className={`h-5 w-5 ${article.isBookmarked ? "fill-current text-primary" : ""}`} />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary rounded-full px-4"
              onClick={(e) => { e.preventDefault(); }}
            >
              Full Intel
            </Button>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}