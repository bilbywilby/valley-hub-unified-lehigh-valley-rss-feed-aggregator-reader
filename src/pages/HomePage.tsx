import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Database, RefreshCcw, Hash, ShieldCheck, Radar, Wifi } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useRSS } from '@/hooks/use-rss';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { applyGeoJitter } from '@/lib/telemetry';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
function LatticeMesh({ active, scanTrigger }: { active: boolean; scanTrigger: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeCanvas = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
  }, []);
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    let animationFrame: number;
    const nodeCount = Math.min(80, Math.floor((window.innerWidth * window.innerHeight) / 12000));
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * 500,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      pulse: Math.random() * Math.PI,
    }));
    let scanPulse = -1;
    const render = () => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, width, height);
      if (scanTrigger > 0 && scanPulse < 0) scanPulse = 0;
      if (scanPulse >= 0) {
        scanPulse += 15;
        ctx.beginPath();
        ctx.arc(width/2, height/2, scanPulse, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(243, 128, 32, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
        if (scanPulse > width * 1.5) scanPulse = -1;
      }
      ctx.strokeStyle = active ? 'rgba(243, 128, 32, 0.3)' : 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 0.5;
      nodes.forEach((node, i) => {
        node.x += node.vx * (active ? 3 : 1);
        node.y += node.vy * (active ? 3 : 1);
        node.pulse += 0.02;
        if (node.x < 0) node.x = width;
        if (node.x > width) node.x = 0;
        if (node.y < 0) node.y = height;
        if (node.y > height) node.y = 0;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = active ? `rgba(243, 128, 32, ${0.4 + Math.sin(node.pulse) * 0.3})` : 'rgba(255, 255, 255, 0.1)';
        ctx.fill();
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dist = Math.hypot(node.x - other.x, node.y - other.y);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.globalAlpha = (1 - dist / 140) * (active ? 0.9 : 0.3);
            ctx.stroke();
          }
        }
      });
      animationFrame = requestAnimationFrame(render);
    };
    render();
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [active, scanTrigger, resizeCanvas]);
  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-full pointer-events-none opacity-70" />
    </div>
  );
}
export function HomePage() {
  const articles = useLiveQuery(() => db.articles.orderBy('pubDate').reverse().limit(100).toArray());
  const feedsCount = useLiveQuery(() => db.feeds.count()) ?? 0;
  const { syncFeeds, isSyncing, error } = useRSS();
  const [bootSequence, setBootSequence] = useState<string[]>([]);
  const [scanPulse, setScanPulse] = useState(0);
  useEffect(() => {
    const announce = async () => {
      const identity = await db.identity.toCollection().first();
      if (!identity) return;
      const jittered = await applyGeoJitter(40.61, -75.47);
      try {
        await fetch('/api/v1/discover/announce', {
          method: 'POST',
          body: JSON.stringify({ nodeId: identity.nodeId, coords: jittered })
        });
        setBootSequence(prev => [...prev, `> SIG_P2P: PEER_FOUND [${identity.nodeId.slice(0, 4)}]`].slice(-6));
      } catch (err) {
        console.warn('Mesh announcement failed', err);
      }
    };
    announce();
    const interval = setInterval(announce, 300000); 
    return () => clearInterval(interval);
  }, []);
  const hasBooted = useRef(false);
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);
  useEffect(() => {
    if (hasBooted.current) return;
    hasBooted.current = true;
    const logs = [
      "> LATTICE_PROTO_V3: CORE_BOOTING...",
      "> ENCLAVE_V3_VERIFIED: HARDWARE_ROOT_READY",
      "> REGIONAL_MESH: SYNCHRONIZING_TOPOLOGY",
      "> PEER_DISCOVERY: SCANNING_P2P_LAYER",
      "> SHARD_CONSENSUS: STABLE [PEERS: 28]",
      "> IO_TRUST_VERIFIED: INTEGRITY_100%",
      "> SYSTEM_READY: LATTICE_CORE_ONLINE"
    ];
    logs.forEach((log, i) => {
      setTimeout(() => {
        setBootSequence(prev => [...prev, log].slice(-6));
      }, i * 300);
    });
    if (feedsCount === 0) setTimeout(() => syncFeeds(), 2000);
  }, [feedsCount, syncFeeds]);
  const triggerScan = () => {
    setScanPulse(prev => prev + 1);
    setBootSequence(prev => [...prev, `> MESH_SCAN: BROADCASTING_P2P_SIGNAL...`].slice(-6));
    setTimeout(() => {
      setBootSequence(prev => [...prev, `> MESH_SCAN: 4 PEERS_REPLICATED`].slice(-6));
    }, 1500);
  };
  return (
    <AppLayout container={true}>
      <div className="space-y-12">
        <section className="bg-surface-container-low rounded-5xl border border-border/10 p-6 md:p-12 shadow-md3-4 overflow-hidden relative min-h-[500px] flex items-center">
          <LatticeMesh active={isSyncing} scanTrigger={scanPulse} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
            <div className="space-y-10">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(243,128,32,0.5)]" />
                <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-primary">Lattice Core // v3.2</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter leading-[0.8] uppercase">
                Lattice <span className="text-primary">Core</span>
              </h1>
              <p className="text-2xl text-muted-foreground font-medium max-w-md leading-tight opacity-80">
                Mesh Protocol v3 Active. Distributed intelligence layer enabled.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button
                  onClick={() => syncFeeds(true)}
                  disabled={isSyncing}
                  className="rounded-full bg-primary h-16 px-10 font-black uppercase text-xs tracking-widest shadow-glow active:scale-95 transition-all group"
                >
                  {isSyncing ? <RefreshCcw className="mr-3 h-5 w-5 animate-spin" /> : <Activity className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform" />}
                  Update Lattice
                </Button>
                <Button
                  onClick={triggerScan}
                  variant="outline"
                  className="rounded-full h-16 px-8 font-black uppercase text-xs tracking-widest border-border/20 bg-black/20 backdrop-blur-md"
                >
                  <Wifi className="mr-3 h-5 w-5 text-primary" />
                  Scan for Peers
                </Button>
              </div>
            </div>
            <div className="bg-black/80 backdrop-blur-2xl rounded-4xl p-8 font-mono text-[11px] leading-relaxed border border-border/10 shadow-2xl min-h-[220px] flex flex-col justify-end">
              <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-2">
                 <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Lattice Health Log</span>
                 <Badge variant="outline" className="text-[8px] font-black border-emerald-500/20 text-emerald-500">STABLE</Badge>
              </div>
              <AnimatePresence mode="popLayout">
                {bootSequence.map((log, i) => (
                  <motion.div
                    key={`${log}-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className={cn(
                      "terminal-text py-1",
                      i === bootSequence.length - 1 ? "text-primary font-bold" : "text-muted-foreground/70"
                    )}
                  >
                    {log}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div className="flex items-center gap-2 mt-4">
                <div className="h-2 w-2 bg-primary animate-ping rounded-full" />
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
            {articles.slice(0, 100).map((article, i) => (
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
              <img src={article.imageUrl} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" alt={article.title} loading="lazy" />
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