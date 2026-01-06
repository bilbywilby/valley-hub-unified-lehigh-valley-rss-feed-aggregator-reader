import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useTelemetry } from '@/hooks/use-telemetry';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bookmark, Share2, Calendar, Globe, ExternalLink, Type, ShieldCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
export function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const articleId = id || '';
  const article = useLiveQuery(() => db.articles.get(articleId), [articleId]);
  const { trackEvent } = useTelemetry();
  const [isReadabilityMode, setIsReadabilityMode] = useState(false);
  const [consensus, setConsensus] = useState<number | null>(null);
  const lastTrackedId = useRef<string | null>(null);
  useEffect(() => {
    if (article && article.id !== lastTrackedId.current) {
      lastTrackedId.current = article.id;
      trackEvent('ARTICLE_VIEW', {
        articleId: article.id,
        source: article.sourceName,
        category: article.category
      });
      let isMounted = true;
      fetch(`/api/signal/stats/${encodeURIComponent(article.feedUrl)}`)
        .then(res => res.json())
        .then(json => {
          if (isMounted && json.success && json.data?.consensusScore) {
            setConsensus(json.data.consensusScore);
          }
        })
        .catch(() => {});
      return () => { isMounted = false; };
    }
  }, [article, trackEvent]);
  const sanitizedContent = useMemo(() => {
    if (!article?.description) return '';
    return article.description.replace(/<style([\s\S]*?)<\/style>/gi, '')
                             .replace(/<script([\s\S]*?)<\/script>/gi, '');
  }, [article]);
  const formattedDate = useMemo(() => {
    if (!article?.pubDate) return '';
    try {
      const date = new Date(article.pubDate);
      return isNaN(date.getTime()) ? '' : format(date, 'MMMM d, yyyy');
    } catch (e) { return ''; }
  }, [article]);
  if (!article) {
    return (
      <AppLayout container={true}>
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <p className="text-muted-foreground terminal-text font-mono uppercase text-xs">ERR_SIGNAL_LOST: Node not found in registry.</p>
          <Button onClick={() => navigate('/')} variant="outline" className="rounded-full">
            <ArrowLeft className="mr-2 h-4 w-4" /> Reconnect to Mesh
          </Button>
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout container={true} className="terminal-bg-scanline min-h-screen">
      <div className="max-w-3xl mx-auto space-y-10 animate-fade-in pb-20">
        <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-md -mx-4 px-4 py-6 md:-mx-8 md:px-8 border-b border-border/10">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate(-1)} className="-ml-4 rounded-full font-mono text-[10px] uppercase tracking-widest hover:bg-primary/10">
              <ArrowLeft className="mr-2 h-4 w-4" /> RECON_UP
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReadabilityMode(!isReadabilityMode)}
                className={cn(
                  "rounded-full font-mono text-[10px] uppercase tracking-widest",
                  isReadabilityMode ? "text-primary bg-primary/10" : "text-muted-foreground"
                )}
              >
                <Type className="h-4 w-4 mr-2" /> {isReadabilityMode ? "RICH_ON" : "TERM_ON"}
              </Button>
            </div>
          </div>
        </header>
        {article.imageUrl && !isReadabilityMode && (
          <div className="aspect-video rounded-4xl overflow-hidden shadow-md3-3 border border-border/50 bg-surface-container-low">
            <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="space-y-8">
          <header className="space-y-6">
            <h1 className={cn(
              "font-display font-black leading-[1.1] tracking-tighter text-foreground",
              isReadabilityMode ? 'text-5xl' : 'text-4xl md:text-5xl'
            )}>
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground border-y py-6 border-border/10">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <span className="font-mono text-xs font-black text-foreground uppercase tracking-widest terminal-text">{article.sourceName}</span>
                {consensus !== null && consensus > 80 && (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-none rounded-full font-black text-[9px] uppercase tracking-widest px-3">
                    <ShieldCheck className="h-3 w-3 mr-1" /> HIGH_TRUST
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest">
                <Calendar className="h-3 w-3" />
                <span>{formattedDate}</span>
              </div>
              <div className="ml-auto flex items-center gap-2 opacity-30 font-mono text-[9px] uppercase tracking-tighter">
                <span>ID: {article.hash.slice(0, 8)}</span>
              </div>
            </div>
          </header>
          <article className={cn(
            "max-w-none transition-all duration-300",
            isReadabilityMode
              ? 'prose prose-neutral dark:prose-invert prose-2xl leading-relaxed font-serif text-pretty'
              : 'prose prose-neutral dark:prose-invert prose-lg prose-p:leading-relaxed prose-headings:font-display prose-headings:font-black prose-headings:tracking-tighter'
          )}>
            {sanitizedContent.includes('<') && sanitizedContent.includes('>') ? (
              <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
            ) : (
              <ReactMarkdown>{sanitizedContent}</ReactMarkdown>
            )}
          </article>
          <div className="pt-12 flex flex-wrap gap-4 border-t border-border/10">
            <Button className="rounded-full bg-primary text-primary-foreground px-8 shadow-md3-2 hover:shadow-glow font-black uppercase text-[10px] tracking-widest" asChild>
              <a href={article.link} target="_blank" rel="noopener noreferrer">
                READ_ORIGINAL <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                await db.articles.update(article.id, { isBookmarked: !article.isBookmarked });
              }}
              className={cn(
                "rounded-full font-black uppercase text-[10px] tracking-widest h-12 px-6",
                article.isBookmarked ? "bg-primary/10 border-primary text-primary" : "bg-surface-container-low border-border/20 shadow-md3-1"
              )}
            >
              <Bookmark className={cn("mr-2 h-4 w-4", article.isBookmarked ? "fill-current" : "")} />
              {article.isBookmarked ? "LATTICE_SAVED" : "CACHE_SAVE"}
            </Button>
            <Button variant="ghost" className="rounded-full hover:bg-surface-container font-black uppercase text-[10px] tracking-widest h-12 px-6">
              <Share2 className="mr-2 h-4 w-4" /> SIGNAL_SEND
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}