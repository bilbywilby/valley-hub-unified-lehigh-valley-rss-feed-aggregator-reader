import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Activity, Network, ShieldCheck, Database, Search, Sparkles, RefreshCcw, Hash, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useRSS } from '@/hooks/use-rss';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';
export function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const articles = useLiveQuery(() => db.articles.orderBy('pubDate').reverse().limit(100).toArray());
  const feedsCount = useLiveQuery(() => db.feeds.count()) ?? 0;
  const { syncFeeds, isSyncing } = useRSS();
  const [bootSequence, setBootSequence] = useState<string[]>([]);
  const hasBooted = useRef(false);
  useEffect(() => {
    if (hasBooted.current) return;
    hasBooted.current = true;
    const logs = [
      "> Initializing Lattice protocol...",
      "> Checking cryptographic identity...",
      "> Found NodeID: verifying secure enclave...",
      "> Reconciling regional master feeds [142 sources]...",
      "> Bootstrapping local article cache...",
      "> Mesh integrity verified. System ready."
    ];
    logs.forEach((log, i) => {
      setTimeout(() => {
        setBootSequence(prev => [...prev, log].slice(-6));
      }, i * 400);
    });
    if (feedsCount === 0) {
      setTimeout(() => syncFeeds(), 3000);
    }
  }, [feedsCount, syncFeeds]);
  const filteredArticles = useMemo(() => {
    if (!articles) return [];
    if (!searchQuery) return articles;
    const q = searchQuery.toLowerCase();
    return articles.filter(a => a.title.toLowerCase().includes(q) || a.sourceName.toLowerCase().includes(q));
  }, [articles, searchQuery]);
  return (
    <AppLayout container={true}>
      <div className="space-y-12">
        {/* LatticeManager Boot Sequence */}
        <section className="bg-surface-container-low rounded-4xl border border-border/20 p-8 shadow-md3-3 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Network className="w-64 h-64 text-primary" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-emerald-500">Node Status: Active</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-display font-black tracking-tighter leading-[0.9]">
                ValleyHub <span className="text-primary">Lattice</span>
              </h1>
              <p className="text-lg text-muted-foreground font-medium max-w-md">
                A high-density regional information mesh. Decentralized processing. Private intelligence.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button 
                  onClick={() => syncFeeds()} 
                  disabled={isSyncing}
                  className="rounded-full bg-primary h-14 px-8 font-black uppercase text-xs tracking-widest shadow-glow active:scale-95 transition-all"
                >
                  {isSyncing ? <RefreshCcw className="mr-2 h-4 w-4 animate-spin" /> : <Activity className="mr-2 h-4 w-4" />}
                  {isSyncing ? "Mesh Syncing" : "Update Network"}
                </Button>
                {isSyncing && (
                   <div className="flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                      <span className="text-[10px] font-mono font-bold text-primary animate-pulse uppercase">Ingesting Protocol v14</span>
                   </div>
                )}
              </div>
            </div>
            <div className="bg-black/40 rounded-3xl p-6 font-mono text-[11px] leading-relaxed border border-border/10 shadow-inner min-h-[160px] flex flex-col justify-end">
              <AnimatePresence>
                {bootSequence.map((log, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    className={i === bootSequence.length - 1 ? "text-primary" : "text-muted-foreground"}
                  >
                    {log}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div className="flex items-center gap-2 mt-4">
                <div className="h-1 w-1 bg-primary animate-ping" />
                <span className="text-primary/50">_</span>
              </div>
            </div>
          </div>
        </section>
        {/* SentinelDashboard Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="relative flex-1 max-w-xl group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Query regional mesh registry..."
              className="pl-14 bg-surface-container-high border-none shadow-md3-1 h-16 rounded-full text-lg font-medium focus-visible:ring-primary focus-visible:ring-offset-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
             <div className="bg-surface-container-high p-1 rounded-full flex gap-1 shadow-md3-1">
                <button className="h-12 px-6 rounded-full bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest">Global</button>
                <button className="h-12 px-6 rounded-full hover:bg-surface-variant font-black uppercase text-[10px] tracking-widest">Verified</button>
             </div>
          </div>
        </div>
        {/* SentinelDashboard Grid */}
        {!articles || filteredArticles.length === 0 ? (
          <div className="py-40 text-center space-y-8 bg-surface-container-low rounded-4xl border-2 border-dashed border-border/10">
             <Database className="h-16 w-16 mx-auto text-muted-foreground/20" />
             <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-widest">Local Cache Empty</h3>
                <p className="text-muted-foreground max-w-xs mx-auto text-sm">Synchronize with the regional lattice to populate your node.</p>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredArticles.map((article, i) => (
              <ArticleCard key={article.id} article={article} index={i} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
function ArticleCard({ article, index }: { article: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.5) }}
      viewport={{ once: true }}
    >
      <Link to={`/article/${article.id}`}>
        <Card className="h-full bg-surface-container-low border-none shadow-md3-1 rounded-3xl group hover:bg-surface-container-high hover:shadow-md3-3 transition-all overflow-hidden flex flex-col">
          <div className="aspect-[4/3] relative overflow-hidden m-3 rounded-2xl bg-black/20">
            {article.imageUrl ? (
              <img src={article.imageUrl} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-10">
                <Hash className="w-16 h-16 text-primary" />
              </div>
            )}
            <div className="absolute top-3 left-3 flex gap-2">
               <Badge className="bg-primary/90 text-primary-foreground border-none font-black text-[9px] uppercase tracking-widest py-1 px-3 rounded-lg backdrop-blur-md">
                 {article.category}
               </Badge>
            </div>
          </div>
          <CardHeader className="px-6 py-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[9px] font-mono font-black text-primary uppercase tracking-tighter truncate max-w-[140px]">{article.sourceName}</span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
              <span className="text-[9px] font-mono text-muted-foreground uppercase">{formatDistanceToNow(new Date(article.pubDate), { addSuffix: true })}</span>
            </div>
            <h3 className="text-lg font-bold leading-[1.2] group-hover:text-primary transition-colors line-clamp-2">
              {article.title}
            </h3>
          </CardHeader>
          <CardContent className="px-6 py-4 mt-auto">
             <div className="pt-4 border-t border-border/5 flex items-center justify-between">
                <div className="flex items-center gap-2 opacity-30 text-[9px] font-mono group-hover:opacity-100 transition-opacity">
                   <Clock className="h-3 w-3" />
                   <span>RECON_SECURE</span>
                </div>
                <div className="text-[9px] font-mono text-muted-foreground">
                   {article.hash.slice(0, 8)}...
                </div>
             </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
function Button({ children, onClick, disabled, className }: any) {
  return (
    <button onClick={onClick} disabled={disabled} className={cn("inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50", className)}>
      {children}
    </button>
  );
}