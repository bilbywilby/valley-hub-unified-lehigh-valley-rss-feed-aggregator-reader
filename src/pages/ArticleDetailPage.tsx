import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useTelemetry } from '@/hooks/use-telemetry';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
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
  const hasArticle = !!article;
  useEffect(() => {
    if (article) {
      trackEvent('ARTICLE_VIEW', {
        articleId: article.id,
        source: article.sourceName,
        category: article.category
      });
      // Fetch source trust data
      fetch(`/api/signal/stats/${encodeURIComponent(article.feedUrl)}`)
        .then(res => res.json())
        .then(json => {
          if (json.success && json.data.consensusScore) {
            setConsensus(json.data.consensusScore);
          }
        })
        .catch(() => {});
    }
  }, [articleId, hasArticle, trackEvent, article]);
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
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className="-ml-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsReadabilityMode(!isReadabilityMode)}
            className={isReadabilityMode ? "text-brand-orange bg-brand-orange/10" : "text-muted-foreground"}
          >
            <Type className="h-4 w-4 mr-2" /> Readability
          </Button>
        </div>
        {article.imageUrl && (
          <div className="aspect-video rounded-4xl overflow-hidden shadow-lg border border-border/50">
            <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="space-y-8">
          <header className="space-y-6">
            <h1 className={`font-display font-bold leading-tight ${isReadabilityMode ? 'text-5xl' : 'text-4xl md:text-5xl'}`}>
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground border-y py-6 border-border/50">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-brand-orange" />
                <span className="font-bold text-foreground tracking-tight">{article.sourceName}</span>
                {consensus !== null && consensus > 80 && (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-none hover:bg-emerald-500/10 ml-2">
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
              ? 'prose prose-neutral dark:prose-invert prose-2xl leading-relaxed font-serif' 
              : 'prose prose-neutral dark:prose-invert prose-lg prose-p:leading-relaxed'
          }`}>
            {sanitizedContent.includes('<') && sanitizedContent.includes('>') ? (
              <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
            ) : (
              <ReactMarkdown>{sanitizedContent}</ReactMarkdown>
            )}
          </article>
          <div className="pt-12 flex flex-wrap gap-4 border-t border-border/50">
            <Button className="btn-gradient px-8 shadow-glow" asChild>
              <a href={article.link} target="_blank" rel="noopener noreferrer">
                Read Original <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                await db.articles.update(article.id, { isBookmarked: !article.isBookmarked });
              }}
              className={article.isBookmarked ? "bg-brand-orange/10 border-brand-orange text-brand-orange" : "bg-card shadow-soft"}
            >
              <Bookmark className={`mr-2 h-4 w-4 ${article.isBookmarked ? "fill-current" : ""}`} />
              {article.isBookmarked ? "Bookmarked" : "Save for Later"}
            </Button>
            <Button variant="outline" className="bg-card shadow-soft">
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}