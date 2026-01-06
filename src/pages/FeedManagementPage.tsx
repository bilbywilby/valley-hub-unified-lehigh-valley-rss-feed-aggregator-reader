import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Trash2, Rss, Globe, ExternalLink, AlertCircle, Sparkles, RefreshCcw, Loader2 } from 'lucide-react';
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
    if (!confirm(`Import ~${MASTER_FEEDS.length} regional feeds? Current sources and articles will be replaced.`)) {
      return;
    }
    setIsBulkLoading(true);
    try {
      await db.feeds.clear();
      await db.articles.clear();
      await db.feeds.bulkAdd(MASTER_FEEDS);
      toast.success(`Lehigh Valley Master List loaded! Starting initial sync...`);
      syncFeeds();
    } catch (err) {
      toast.error("Failed to load master feeds");
    } finally {
      setIsBulkLoading(false);
    }
  };
  const removeFeed = async (id: string) => {
    await db.feeds.delete(id);
    await db.articles.where('feedUrl').equals(id).delete();
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
                {isBulkLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-5 w-5" />
                )}
                Load Master LV Feeds
              </Button>
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/50"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground font-bold">Manual Entry</span></div>
              </div>
            </div>
            <CardHeader className="pt-0">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plus className="h-5 w-5 text-brand-orange" /> Add Source
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddFeed} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Feed URL (RSS/Atom)"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="bg-secondary/30 border-none shadow-inner"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    placeholder="Category (e.g., News, Tech)"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-secondary/30 border-none shadow-inner"
                  />
                </div>
                <Button type="submit" className="w-full btn-gradient shadow-soft h-11">
                  Add Source
                </Button>
              </form>
            </CardContent>
          </Card>
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Rss className="h-5 w-5 text-brand-orange" />
                Active Subscriptions {feeds && `(${feeds.length})`}
              </h2>
            </div>
            {!feeds || feeds.length === 0 ? (
              <div className="p-16 border-2 border-dashed border-border rounded-4xl text-center space-y-4 opacity-60">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="font-medium">No feeds found. Load the master list to get started!</p>
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
  const statusColor = useMemo(() => {
    if (feed.quality > 80) return "bg-emerald-500";
    if (feed.quality > 50) return "bg-amber-500";
    return "bg-destructive";
  }, [feed.quality]);
  return (
    <Card className="shadow-soft border-none group relative overflow-hidden bg-card">
      <CardHeader className="p-5 pb-2">
        <div className="flex justify-between items-start">
          <Badge variant="secondary" className="mb-2 bg-muted/50 text-muted-foreground">{feed.category}</Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <CardTitle className="text-lg truncate font-bold">{feed.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-2 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-2xs text-muted-foreground uppercase tracking-widest font-bold">
            <span className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
              Quality Score
            </span>
            <span>{feed.quality}%</span>
          </div>
          <Progress value={feed.quality} className="h-1.5 bg-secondary" />
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
          <a href={feed.htmlUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-brand-orange transition-colors font-medium">
            <Globe className="h-3 w-3" /> Website
          </a>
          <a href={feed.xmlUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-brand-orange transition-colors font-medium">
            <ExternalLink className="h-3 w-3" /> XML
          </a>
        </div>
      </CardContent>
    </Card>
  );
}