import React, { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, Bookmark, Share2, RefreshCcw, Rss, Search, Sparkles } from 'lucide-react';
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
  const { syncFeeds, isSyncing } = useRSS();
  const hasAttemptedAutoSync = useRef(false);
  useEffect(() => {
    getOrCreateIdentity();
  }, []);
  // Auto-sync on first run if articles are empty but feeds exist
  useEffect(() => {
    if (articles && articles.length === 0 && feedsCount > 0 && !isSyncing && !hasAttemptedAutoSync.current) {
      hasAttemptedAutoSync.current = true;
      syncFeeds();
    }
  }, [articles, feedsCount, isSyncing, syncFeeds]);
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
        {/* Hero Section - MD3 Surface Level 2 */}
        <section className="relative rounded-4xl overflow-hidden bg-surface-container-high p-8 md:p-12 lg:p-16 shadow-md3-2 border border-border/50">
          <div className="relative z-10 max-w-3xl space-y-6">
            <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 rounded-full font-bold tracking-tight">
              <Sparkles className="h-3 w-3 mr-2 inline" /> Lehigh Valley Intelligence
            </Badge>
            <h1 className="text-5xl md:text-6xl font-display font-extrabold text-foreground leading-tight tracking-tight">
              Local News, <span className="text-primary italic">Refined</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium max-w-xl text-pretty leading-relaxed">
              Privacy-first aggregation of the region's most relevant stories.
            </p>
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => syncFeeds()}
                  disabled={isSyncing}
                  size="lg"
                  className="rounded-full bg-primary text-primary-foreground hover:shadow-glow px-8 h-12 transition-all"
                >
                  {isSyncing ? <RefreshCcw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                  {isSyncing ? "Syncing Mesh..." : "Update Feed"}
                </Button>
                {isSyncing && (
                  <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-primary/5 border border-primary/10">
                    <span className="text-xs font-bold text-primary animate-pulse">Processing Sources</span>
                  </div>
                )}
              </div>
              {isSyncing && (
                <div className="space-y-2 max-w-xs">
                  <Progress value={45} className="h-1 bg-primary/10" />
                  <p className="text-[10px] uppercase font-black tracking-widest text-primary/60">Mesh Reconciliation in Progress</p>
                </div>
              )}
            </div>
          </div>
          <div className="absolute right-[-5%] bottom-[-10%] opacity-5 pointer-events-none select-none">
            <Rss className="w-96 h-96 text-primary rotate-12" />
          </div>
        </section>
        {/* Search - MD3 Mapped Input */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search local intelligence..."
              className="pl-12 bg-surface-container-low border-none shadow-md3-1 h-14 rounded-full text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-full border-none bg-surface-container h-12 px-6 font-bold shadow-md3-1 hover:shadow-md3-2">Latest</Button>
            <Button variant="ghost" className="rounded-full h-12 px-6 font-bold text-muted-foreground hover:text-primary">Regional</Button>
          </div>
        </div>
        {/* Article Grid */}
        {!articles || filteredArticles.length === 0 ? (
          <div className="py-32 text-center space-y-6 bg-surface-container-low rounded-4xl border-2 border-dashed border-border/50 animate-fade-in">
            <div className="w-24 h-24 bg-surface-container-high rounded-full flex items-center justify-center mx-auto shadow-md3-1">
              <Newspaper className="h-10 w-10 text-primary/40" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold">Waiting for Ingestion</h3>
              <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
                {feedsCount === 0 ? "Initial setup required. Head to Manage Feeds." : "Our mesh is currently updating. This usually takes a few seconds."}
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
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.4 }}
    >
      <Link to={`/article/${article.id}`}>
        <Card className="md3-card h-full flex flex-col group border-none">
          <div className="aspect-[16/10] relative overflow-hidden m-2 rounded-2xl bg-surface-container-high">
            {article.imageUrl ? (
              <img
                src={article.imageUrl}
                alt={article.title}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-primary/5 flex items-center justify-center p-6 text-center">
                 <Newspaper className="h-10 w-10 text-primary/20" />
              </div>
            )}
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge className="bg-primary text-primary-foreground border-none rounded-lg shadow-md">
                {article.category || 'News'}
              </Badge>
            </div>
          </div>
          <CardHeader className="px-5 pb-2 pt-3">
            <div className="flex items-center gap-2 text-[10px] text-primary font-black uppercase tracking-widest mb-2 opacity-70">
              <span className="truncate">{article.sourceName}</span>
              <span className="text-muted-foreground font-normal opacity-50">/</span>
              <span className="truncate text-muted-foreground lowercase font-medium">{timeAgo}</span>
            </div>
            <h3 className="text-lg font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
              {article.title}
            </h3>
          </CardHeader>
          <CardContent className="px-5 pt-0 flex-grow">
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed opacity-80">
              {article.description?.replace(/<[^>]*>?/gm, '')}
            </p>
          </CardContent>
          <CardFooter className="px-5 py-4 pt-0 flex justify-between items-center mt-auto border-t border-border/20">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
              onClick={(e) => {
                e.preventDefault();
                db.articles.update(article.id, { isBookmarked: !article.isBookmarked });
              }}
            >
              <Bookmark className={`h-5 w-5 ${article.isBookmarked ? "fill-current text-primary" : ""}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary"
              onClick={(e) => { e.preventDefault(); }}
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}