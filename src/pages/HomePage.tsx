import React from 'react';
import { motion } from 'framer-motion';
import { Newspaper, ChevronRight, Bookmark, Share2, Clock, Globe } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MOCK_ARTICLES } from '@shared/mock-data';
import type { Article } from '@shared/types';
import { formatDistanceToNow } from 'date-fns';
export function HomePage() {
  return (
    <AppLayout container={true}>
      <div className="space-y-16">
        {/* Hero Section */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-mesh p-8 md:p-16 lg:p-24 shadow-soft">
          <div className="relative z-10 max-w-3xl space-y-6">
            <Badge className="bg-white/20 text-white backdrop-blur-md border-none px-4 py-1">
              What's New in Lehigh Valley
            </Badge>
            <h1 className="text-5xl md:text-7xl font-display font-extrabold text-white leading-tight">
              Stay Connected to your <span className="text-black/20">Community</span>
            </h1>
            <p className="text-xl text-white/90 font-medium max-w-xl text-pretty">
              Aggregated, curated, and privacy-focused news from the heart of Pennsylvania. Your local world, unified.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button size="lg" className="bg-white text-brand-orange hover:bg-brand-orange hover:text-white border-none shadow-lg">
                Start Reading <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white/40 hover:bg-white/10 backdrop-blur-sm">
                Explore Feeds
              </Button>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
            <Newspaper className="w-96 h-96 -mr-24 -mb-24 rotate-12" />
          </div>
        </section>
        {/* Article Grid */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Latest Stories</h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="text-muted-foreground">Recent</Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground">Popular</Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {MOCK_ARTICLES.map((article, index) => (
              <ArticleCard key={article.id} article={article} index={index} />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
function ArticleCard({ article, index }: { article: Article; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Card className="h-full flex flex-col group hover:shadow-xl transition-all duration-300 border-none bg-card shadow-soft overflow-hidden">
        <div className="aspect-video relative overflow-hidden">
          <img
            src={article.imageUrl || "https://images.unsplash.com/photo-1585829365234-78d955c29516?auto=format&fit=crop&q=80&w=1000"}
            alt={article.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
          <Badge className="absolute top-3 left-3 bg-brand-orange/90 text-white backdrop-blur-sm border-none">
            {article.category}
          </Badge>
        </div>
        <CardHeader className="p-5 pb-2">
          <div className="flex items-center gap-2 text-2xs text-muted-foreground mb-2">
            <Globe className="h-3 w-3" />
            <span>{article.sourceName}</span>
            <span>•</span>
            <Clock className="h-3 w-3" />
            <span>{formatDistanceToNow(new Date(article.pubDate))} ago</span>
          </div>
          <h3 className="text-lg font-bold leading-snug group-hover:text-brand-orange transition-colors line-clamp-2">
            {article.title}
          </h3>
        </CardHeader>
        <CardContent className="p-5 pt-0 flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {article.description}
          </p>
        </CardContent>
        <CardFooter className="p-5 pt-0 flex justify-between items-center border-t border-border/40 mt-auto">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-brand-orange">
            <Bookmark className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-brand-orange">
            <Share2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}