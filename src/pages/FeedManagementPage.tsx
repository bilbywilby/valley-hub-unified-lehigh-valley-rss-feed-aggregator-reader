import React, { useState, useMemo, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Trash2, Rss, Globe, ExternalLink, AlertCircle, Sparkles, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
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
    } catch (e) {
      toast.error("Please enter a valid URL");
    }
  };
  const handleLoadMasterFeeds = async () => {
    if (!confirm(`Import ~${MASTER_FEEDS.length} regional feeds?`)) return;
    setIsBulkLoading(true);
    try {
      await db.feeds.clear();
      await db.articles.clear();
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
          <h1 className="text-4xl font-display font-bold">Manage Feeds</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Build your personalized Lehigh Valley stream.
          </p>
        </header>
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 h-fit shadow-soft border-none bg-card">
            <div className="p-6 pb-0">
              <Button
                onClick={handleLoadMasterFeeds}
                disabled={isSyncing || isBulkLoading}
                className="w-full bg-brand-orange hover:bg-brand-red-orange text-white shadow-glow mb-6 h-12 text-md font-bold"
              >
                {isBulkLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                Load Master LV Feeds
              </Button>
            </div>
            <CardHeader className="pt-0">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plus className="h-5 w-5 text-brand-orange" /> Add Source
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddFeed} className="space-y-4">
                <Input placeholder="Feed URL (RSS/Atom)" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} className="bg-secondary/30 border-none" />
                <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} className="bg-secondary/30 border-none" />
                <Button type="submit" className="w-full btn-gradient h-11">Add Source</Button>
              </form>
            </CardContent>
          </Card>
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Rss className="h-5 w-5 text-brand-orange" />
              Active Subscriptions {feeds && `(${feeds.length})`}
            </h2>
            {!feeds || feeds.length === 0 ? (
              <div className="p-16 border-2 border-dashed rounded-4xl text-center space-y-4 opacity-60">
                <AlertCircle className="h-12 w-12 mx-auto" />
                <p>No feeds found. Load the master list to get started!</p>
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
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/signal/stats/${encodeURIComponent(feed.xmlUrl)}`);
        const json = await res.json();
        if (json.success) setGlobalStats(json.data);
      } catch (e) {}
    };
    fetchStats();
  }, [feed.xmlUrl]);
  const handleVote = async (score: number) => {
    if (!identity) return;
    try {
      const res = await fetch('/api/signal/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-node-id': identity.nodeId },
        body: JSON.stringify({ feedUrl: feed.xmlUrl, score })
      });
      if (res.ok) {
        toast.success("Vote registered with mesh");
        await db.votes.put({ feedUrl: feed.xmlUrl, lastVoted: Date.now(), score });
      }
    } catch (e) {
      toast.error("Failed to vote");
    }
  };
  const score = globalStats?.consensusScore ?? feed.quality;
  return (
    <Card className="shadow-soft border-none group relative overflow-hidden bg-card">
      <CardHeader className="p-5 pb-2">
        <div className="flex justify-between items-start">
          <Badge variant="secondary" className="mb-2 bg-muted/50 text-muted-foreground">{feed.category}</Badge>
          <Button variant="ghost" size="icon" onClick={onRemove} className="h-8 w-8 hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <CardTitle className="text-lg truncate font-bold">{feed.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-2 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground">
            <span className="flex items-center gap-1">Mesh Quality Index</span>
            <span>{score}%</span>
          </div>
          <Progress value={score} className="h-1.5 bg-secondary" />
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="flex gap-3 text-xs text-muted-foreground">
            <a href={feed.htmlUrl} target="_blank" className="hover:text-brand-orange font-medium flex items-center gap-1">
              <Globe className="h-3 w-3" /> Web
            </a>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-emerald-500" onClick={() => handleVote(100)}>
              <ThumbsUp className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={() => handleVote(0)}>
              <ThumbsDown className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}