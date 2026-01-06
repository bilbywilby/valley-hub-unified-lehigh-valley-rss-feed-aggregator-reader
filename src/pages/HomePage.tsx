import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Network, Database, RefreshCcw, Hash, Clock, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useRSS } from '@/hooks/use-rss';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
function LatticeMesh({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrame: number;
    const nodes = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      pulse: Math.random() * Math.PI,
    }));
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = active ? 'rgba(243, 128, 32, 0.2)' : 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 0.5;
      nodes.forEach((node, i) => {
        node.x += node.vx * (active ? 2 : 1);
        node.y += node.vy * (active ? 2 : 1);
        node.pulse += 0.02;
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = active ? `rgba(243, 128, 32, ${0.3 + Math.sin(node.pulse) * 0.2})` : 'rgba(255, 255, 255, 0.1)';
        ctx.fill();
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dist = Math.hypot(node.x - other.x, node.y - other.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.globalAlpha = (1 - dist / 100) * (active ? 0.8 : 0.3);
            ctx.stroke();
          }
        }
      });
      animationFrame = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [active]);
  return <canvas ref={canvasRef} width={800} height={400} className="absolute inset-0 w-full h-full pointer-events-none opacity-60" />;
}
export function HomePage() {
  const articles = useLiveQuery(() => db.articles.orderBy('pubDate').reverse().limit(100).toArray());
  const feedsCount = useLiveQuery(() => db.feeds.count()) ?? 0;
  const { syncFeeds, isSyncing, error } = useRSS();
  const [bootSequence, setBootSequence] = useState<string[]>([]);
  const hasBooted = useRef(false);
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);
  useEffect(() => {
    if (hasBooted.current) return;
    hasBooted.current = true;
    const logs = [
      "> LATTICE_PROTO_V2: Initializing...",
      "> ENCLAVE_V2_LOADED: Secure Shard Verified.",
      "> REGIONAL_MESH: Reconciling master streams...",
      "> SHARD_CONSENSUS: STABLE [Nodes: 14]",
      articles && articles.length > 0 ? "> CACHE_RECON: Local registry synchronized." : "> CACHE_NULL: Sync mandatory.",
      "> SYSTEM_READY: Integrity verified."
    ];
    logs.forEach((log, i) => {
      setTimeout(() => {
        setBootSequence(prev => [...prev, log].slice(-6));
      }, i * 350);
    });
    if (feedsCount === 0) setTimeout(() => syncFeeds(), 3000);
  }, [feedsCount, syncFeeds, articles]);
  return (
    <AppLayout container={true}>
      <div className="space-y-12">
        <section className="bg-surface-container-low rounded-4xl border border-border/10 p-10 shadow-md3-3 overflow-hidden relative min-h-[400px] flex items-center">
          <LatticeMesh active={isSyncing} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-emerald-500">Lattice v2 // Active</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-display font-black tracking-tighter leading-[0.85] uppercase">
                Valley <span className="text-primary">Lattice</span>
              </h1>
              <p className="text-xl text-muted-foreground font-medium max-w-md leading-relaxed">
                A high-density regional intelligence mesh. Distributed processing. Absolute privacy.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button
                  onClick={() => syncFeeds(true)}
                  disabled={isSyncing}
                  className="rounded-full bg-primary h-16 px-10 font-black uppercase text-xs tracking-widest shadow-glow active:scale-95 transition-all group"
                >
                  {isSyncing ? <RefreshCcw className="mr-3 h-5 w-5 animate-spin" /> : <Activity className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform" />}
                  {isSyncing ? "Mesh Syncing..." : "Update Network"}
                </Button>
                {isSyncing && (
                   <div className="flex items-center px-6 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md">
                      <span className="text-[10px] font-mono font-bold text-primary animate-pulse uppercase tracking-widest">Protocol v14_Ingesting</span>
                   </div>
                )}
              </div>
            </div>
            <div className="bg-black/60 backdrop-blur-md rounded-3xl p-8 font-mono text-[11px] leading-relaxed border border-border/10 shadow-2xl min-h-[200px] flex flex-col justify-end">
              <AnimatePresence>
                {bootSequence.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "terminal-text py-0.5",
                      i === bootSequence.length - 1 ? "text-primary font-bold" : "text-muted-foreground/80"
                    )}
                  >
                    {log}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div className="flex items-center gap-2 mt-4">
                <div className="h-1.5 w-1.5 bg-primary animate-ping" />
                <span className="text-primary/50 text-sm">_</span>
              </div>
            </div>
          </div>
        </section>
        {!articles || articles.length === 0 ? (
          <div className="py-40 text-center space-y-8 bg-surface-container-low rounded-4xl border-2 border-dashed border-border/10">
             <Database className="h-16 w-16 mx-auto text-muted-foreground/20" />
             <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-widest">Local Registry Empty</h3>
                <p className="text-muted-foreground max-w-xs mx-auto text-sm">Synchronize with the regional lattice to populate your node.</p>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {articles.map((article, i) => (
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
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4) }}
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
              <span className="text-[10px] font-mono font-black text-primary uppercase tracking-tighter truncate max-w-[140px]">{article.sourceName}</span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
              <span className="text-[10px] font-mono text-muted-foreground uppercase">{formatDistanceToNow(new Date(article.pubDate), { addSuffix: true })}</span>
            </div>
            <h3 className="text-lg font-bold leading-[1.2] group-hover:text-primary transition-colors line-clamp-2">
              {article.title}
            </h3>
          </CardHeader>
          <CardContent className="px-6 py-4 mt-auto">
             <div className="pt-4 border-t border-border/5 flex items-center justify-between">
                <div className="flex items-center gap-2 opacity-30 text-[9px] font-mono group-hover:opacity-100 transition-opacity">
                   <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                   <span>ENCLAVE_SYNC</span>
                </div>
                <div className="text-[9px] font-mono text-muted-foreground opacity-50">
                   {article.hash.slice(0, 10)}
                </div>
             </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}