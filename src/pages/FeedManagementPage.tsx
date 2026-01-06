import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Trash2, Rss, Globe, ExternalLink, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
export function FeedManagementPage() {
  const [newUrl, setNewUrl] = useState('');
  const [category, setCategory] = useState('News');
  const feeds = useLiveQuery(() => db.feeds.toArray());
  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;
    const id = uuidv4();
    await db.feeds.add({
      id,
      title: new URL(newUrl).hostname,
      xmlUrl: newUrl,
      htmlUrl: new URL(newUrl).origin,
      category,
      quality: 100,
      language: 'en',
    });
    setNewUrl('');
  };
  const removeFeed = async (id: string) => {
    await db.feeds.delete(id);
    await db.articles.where('feedUrl').equals(id).delete();
  };
  return (
    <AppLayout container={true}>
      <div className="space-y-12">
        <header className="space-y-4">
          <h1 className="text-4xl font-display font-bold">Manage Feeds</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Customize your Lehigh Valley stream. Add RSS or Atom feeds from local news sources, blogs, and community portals.
          </p>
        </header>
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 h-fit shadow-soft border-none bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-brand-orange" /> Add New Source
              </CardTitle>
              <CardDescription>Enter a valid RSS or Atom feed URL.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddFeed} className="space-y-4">
                <div className="space-y-2">
                  <Input 
                    placeholder="https://example.com/feed.xml" 
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Input 
                    placeholder="Category (e.g., News, Lifestyle)" 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-secondary/50"
                  />
                </div>
                <Button type="submit" className="w-full btn-gradient">
                  Add Source
                </Button>
              </form>
            </CardContent>
          </Card>
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Rss className="h-5 w-5 text-brand-orange" /> 
                Subscribed Sources {feeds && `(${feeds.length})`}
              </h2>
            </div>
            {feeds && feeds.length === 0 ? (
              <div className="p-12 border-2 border-dashed rounded-3xl text-center space-y-4 opacity-60">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                <p>No feeds subscribed yet. Add your first source to start reading.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feeds?.map((feed) => (
                  <Card key={feed.id} className="shadow-soft border-none group relative overflow-hidden">
                    <CardHeader className="p-5 pb-2">
                      <div className="flex justify-between items-start">
                        <Badge variant="secondary" className="mb-2">{feed.category}</Badge>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeFeed(feed.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardTitle className="text-lg">{feed.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 pt-2 space-y-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-2xs text-muted-foreground uppercase tracking-wider font-bold">
                          <span>Feed Quality</span>
                          <span>{feed.quality}%</span>
                        </div>
                        <Progress value={feed.quality} className="h-1.5" />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                        <a href={feed.htmlUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-brand-orange transition-colors">
                          <Globe className="h-3 w-3" /> Website
                        </a>
                        <a href={feed.xmlUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-brand-orange transition-colors">
                          <ExternalLink className="h-3 w-3" /> Source
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}