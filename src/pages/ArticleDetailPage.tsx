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
      // Fetch source trust data from mesh
      fetch(`/api/signal/stats/${encodeURIComponent(article.feedUrl)}`)
        .then(res => res.json())
        .then(json => {
          if (isMounted && json.success && json.data?.consensusScore) {
            setConsensus(json.data.consensusScore);
          }
        })
        .catch(() => {
          // Silent catch for network stats
        });
      return () => {
        isMounted = false;
      };
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
    } catch (e) {
      return '';
    }
  }, [article]);
  if (!article) {
    return (
      <AppLayout container={true}>
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <p className="text-muted-foreground">Article not found.</p>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Feed
          </Button>
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout container={true}>
      <div className="max-w-3xl mx-auto space-y-10 animate-fade-in">
        <header className="sticky top-[73px] z-20 bg-background/95 backdrop-blur-md -mx-4 px-4 py-4 md:-mx-8 md:px-8 border-b border-border/10">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate(-1)} className="-ml-4 rounded-full">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsReadabilityMode(!isReadabilityMode)}
              className={isReadabilityMode ? "text-primary bg-primary/10 rounded-full" : "text-muted-foreground rounded-full"}
            >
              <Type className="h-4 w-4 mr-2" /> Readability
            </Button>
          </div>
        </header>
        {article.imageUrl && (
          <div className="aspect-video rounded-4xl overflow-hidden shadow-md3-2 border border-border/50">
            <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="space-y-8">
          <header className="space-y-6">
            <h1 className={`font-display font-extrabold leading-tight tracking-tight text-foreground ${isReadabilityMode ? 'text-5xl' : 'text-4xl md:text-5xl'}`}>
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground border-y py-6 border-border/10">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <span className="font-bold text-foreground tracking-tight">{article.sourceName}</span>
                {consensus !== null && consensus > 80 && (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-none hover:bg-emerald-500/10 ml-2 rounded-full font-black text-[10px] uppercase">
                    <ShieldCheck className="h-3 w-3 mr-1" /> High Trust
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">{formattedDate}</span>
              </div>
            </div>
          </header>
          <article className={`max-w-none transition-all duration-300 ${
            isReadabilityMode
              ? 'prose prose-neutral dark:prose-invert prose-2xl leading-relaxed font-serif text-pretty'
              : 'prose prose-neutral dark:prose-invert prose-lg prose-p:leading-relaxed'
          }`}>
            {sanitizedContent.includes('<') && sanitizedContent.includes('>') ? (
              <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
            ) : (
              <ReactMarkdown>{sanitizedContent}</ReactMarkdown>
            )}
          </article>
          <div className="pt-12 flex flex-wrap gap-4 border-t border-border/10">
            <Button className="rounded-full bg-primary text-primary-foreground px-8 shadow-glow hover:shadow-lg" asChild>
              <a href={article.link} target="_blank" rel="noopener noreferrer">
                Read Original <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                await db.articles.update(article.id, { isBookmarked: !article.isBookmarked });
              }}
              className={article.isBookmarked ? "bg-primary/10 border-primary text-primary rounded-full" : "bg-surface-container-low border-none shadow-md3-1 rounded-full"}
            >
              <Bookmark className={`mr-2 h-4 w-4 ${article.isBookmarked ? "fill-current" : ""}`} />
              {article.isBookmarked ? "Bookmarked" : "Save for Later"}
            </Button>
            <Button variant="ghost" className="rounded-full hover:bg-surface-container">
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}