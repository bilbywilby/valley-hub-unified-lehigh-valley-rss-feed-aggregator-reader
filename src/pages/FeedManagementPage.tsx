import React, { useState, useMemo, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Trash2, Rss, Globe, AlertCircle, Sparkles, Loader2, ThumbsUp, ThumbsDown, ShieldCheck } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { MASTER_FEEDS } from '@shared/master-feeds';
import { toast } from 'sonner';
import { useRSS } from '@/hooks/use-rss';
export function FeedManagementPage() {
  const [newUrl, setNewUrl] = useState('');
  const [category, setCategory] = useState('News');
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const feeds = useLiveQuery(() => db.feeds.toArray());
  const { syncFeeds, isSyncing } = useRSS();
  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;
    try {
      const url = new URL(newUrl);
      const existing = await db.feeds.where('xmlUrl').equals(newUrl).first();
      if (existing) {
        toast.error("Feed already exists");
        return;
      }
      await db.feeds.add({
        id: uuidv4(),
        title: url.hostname.replace('www.', ''),
        xmlUrl: newUrl,
        htmlUrl: url.origin,
        category,
        quality: 100,
        language: 'en',
      });
      setNewUrl('');
      toast.success("Source added successfully");
    } catch (err) {
      toast.error("Please enter a valid URL");
    }
  };
  const handleLoadMasterFeeds = async () => {
    if (!confirm(`Import ~${MASTER_FEEDS.length} regional feeds?`)) return;
    setIsBulkLoading(true);
    try {
      await db.feeds.clear();
      await db.clearNonBookmarkedArticles();
      await db.feeds.bulkAdd(MASTER_FEEDS);
      toast.success(`Lehigh Valley Master List loaded!`);
      syncFeeds();
    } catch (err) {
      toast.error("Failed to load master feeds");
    } finally {
      setIsBulkLoading(false);
    }
  };
  const removeFeed = async (id: string) => {
    await db.feeds.delete(id);
    toast.info("Source removed");
  };
  return (
    <AppLayout container={true}>
      <div className="space-y-12">
        <header className="space-y-4">
          <h1 className="text-5xl font-display font-black tracking-tighter uppercase">Sentinel Grid</h1>
          <p className="text-muted-foreground text-xl max-w-2xl font-medium opacity-80">
            Regional Mesh configuration and Feed Quality assessments.
          </p>
        </header>
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 h-fit shadow-md3-2 border-none bg-surface-container-low rounded-4xl">
            <div className="p-8 pb-0">
              <Button
                onClick={handleLoadMasterFeeds}
                disabled={isSyncing || isBulkLoading}
                className="w-full bg-primary hover:bg-brand-red-orange text-primary-foreground shadow-glow mb-6 h-14 rounded-2xl text-sm font-black uppercase tracking-widest"
              >
                {isBulkLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                LOAD_MASTER_LIST
              </Button>
            </div>
            <CardHeader className="pt-0 px-8">
              <CardTitle className="flex items-center gap-2 text-[11px] font-mono font-black uppercase tracking-[0.2em] text-muted-foreground">
                <Plus className="h-5 w-5 text-primary" /> REGISTER_NODE
              </CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleAddFeed} className="space-y-4">
                <Input placeholder="URL (RSS/Atom)" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} className="bg-black/20 border-border/10 h-12 rounded-xl font-mono text-xs" />
                <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} className="bg-black/20 border-border/10 h-12 rounded-xl font-mono text-xs" />
                <Button type="submit" className="w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest">SUBMIT_SOURCE</Button>
              </form>
            </CardContent>
          </Card>
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-black font-display uppercase tracking-widest flex items-center gap-2">
              <Rss className="h-5 w-5 text-primary" />
              Active_Signals {feeds && `[${feeds.length}]`}
            </h2>
            {!feeds || feeds.length === 0 ? (
              <div className="p-24 border-2 border-dashed rounded-4xl text-center space-y-6 opacity-40 bg-surface-container-low">
                <AlertCircle className="h-16 w-16 mx-auto text-primary/40" />
                <p className="text-xl font-bold">LATTICE_NULL: LOAD MASTER LIST</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feeds.map((feed) => (
                  <FeedCard key={feed.id} feed={feed} onRemove={() => removeFeed(feed.id)} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
function FeedCard({ feed, onRemove }: { feed: any, onRemove: () => void }) {
  const [globalStats, setGlobalStats] = useState<any>(null);
  const identity = useLiveQuery(() => db.identity.toCollection().first());
  const sigId = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < feed.xmlUrl.length; i++) {
      hash = ((hash << 5) - hash) + feed.xmlUrl.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).substring(0, 8).toUpperCase();
  }, [feed.xmlUrl]);
  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/signal/stats/${encodeURIComponent(feed.xmlUrl)}`);
        const json = await res.json();
        if (isMounted && json.success) setGlobalStats(json.data);
      } catch (err) {
        console.warn(`[MESH] Signal lookup failed for ${feed.title}`);
      }
    };
    fetchStats();
    return () => { isMounted = false; };
  }, [feed.xmlUrl, feed.title]);
  const score = globalStats?.consensusScore ?? feed.quality;
  const delta = Math.abs(score - feed.quality);
  return (
    <Card className="shadow-md3-1 border-none group relative overflow-hidden bg-surface-container-low rounded-3xl transition-all hover:bg-surface-container-high hover:shadow-md3-2">
      <div className="absolute top-4 right-4 font-mono text-[9px] font-black text-primary opacity-40 group-hover:opacity-100 transition-opacity">
        SIG_ID: {sigId}
      </div>
      <CardHeader className="p-6 pb-2">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="mb-2 bg-black/20 text-muted-foreground font-mono text-[8px] uppercase tracking-widest border-border/10">{feed.category}</Badge>
          <Button variant="ghost" size="icon" onClick={onRemove} className="h-8 w-8 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <CardTitle className="text-lg truncate font-black tracking-tight">{feed.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-2 space-y-5">
        <div className="space-y-3">
          <div className="flex justify-between text-[10px] uppercase font-black text-muted-foreground/60 tracking-widest">
            <span className="flex items-center gap-1">IQS_QUALITY_INDEX</span>
            <span className="text-primary">{score}%</span>
          </div>
          <div className="relative h-2 w-full bg-black/20 rounded-full overflow-hidden">
             <div 
               className="absolute top-0 left-0 h-full bg-primary/40 transition-all duration-1000" 
               style={{ width: `${feed.quality}%` }}
             />
             <div 
               className="absolute top-0 left-0 h-full bg-primary shadow-[0_0_10px_hsl(var(--primary))] transition-all duration-1000" 
               style={{ width: `${score}%` }}
             />
          </div>
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="flex gap-4">
            <a href={feed.htmlUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono font-black uppercase tracking-tighter text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" /> SOURCE_WEB
            </a>
            {feed.successCount > 0 && (
              <div className="flex items-center gap-1 text-[9px] font-mono font-black text-emerald-500 animate-pulse">
                <ShieldCheck className="h-3 w-3" /> SIGNAL_ACTIVE
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors">
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors">
              <ThumbsDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}