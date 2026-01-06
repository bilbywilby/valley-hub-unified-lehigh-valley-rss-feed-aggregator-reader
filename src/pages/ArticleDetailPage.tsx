import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useTelemetry } from '@/hooks/use-telemetry';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bookmark, Share2, Calendar, Globe, ExternalLink, Type } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
export function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const article = useLiveQuery(() => db.articles.get(id || ''), [id]);
  const { trackEvent } = useTelemetry();
  const [isReadabilityMode, setIsReadabilityMode] = useState(false);
  // Track view exactly once per component mount for a specific article
  useEffect(() => {
    if (article) {
      trackEvent('ARTICLE_VIEW', {
        articleId: article.id,
        source: article.sourceName,
        category: article.category
      });
    }
  }, [id, !!article, trackEvent]);
  const sanitizedContent = useMemo(() => {
    if (!article?.description) return '';
    // Basic cleanup for HTML often found in RSS
    return article.description.replace(/<style([\s\S]*?)<\/style>/gi, '')
                             .replace(/<script([\s\S]*?)<\/script>/gi, '');
  }, [article?.description]);
  const formattedDate = useMemo(() => {
    if (!article?.pubDate) return '';
    try {
      const date = new Date(article.pubDate);
      if (isNaN(date.getTime())) return '';
      return format(date, 'MMMM d, yyyy');
    } catch (e) {
      return '';
    }
  }, [article?.pubDate]);
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
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="hover:bg-accent -ml-4"
          >
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
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
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
            {/* Handle embedded HTML from RSS feeds using dangerouslySetInnerHTML for raw descriptions */}
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
                if (!article.isBookmarked) trackEvent('BOOKMARK_ADD', { articleId: article.id });
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