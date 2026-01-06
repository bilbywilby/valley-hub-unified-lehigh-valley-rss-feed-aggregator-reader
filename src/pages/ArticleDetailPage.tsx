import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useTelemetry } from '@/hooks/use-telemetry';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bookmark, Share2, Calendar, Globe, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
export function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const article = useLiveQuery(() => db.articles.get(id || ''), [id]);
  const { trackEvent } = useTelemetry();
  useEffect(() => {
    if (article) {
      trackEvent('ARTICLE_VIEW', { 
        articleId: article.id, 
        source: article.sourceName,
        category: article.category 
      });
    }
  }, [article, trackEvent]);
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
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="hover:bg-accent -ml-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        {article.imageUrl && (
          <div className="aspect-video rounded-3xl overflow-hidden shadow-lg">
            <img 
              src={article.imageUrl} 
              alt={article.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground border-y py-4 border-border/50">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="font-medium text-foreground">{article.sourceName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(article.pubDate), 'MMMM d, yyyy')}</span>
              </div>
            </div>
          </div>
          <div className="prose prose-neutral dark:prose-invert max-w-none prose-lg prose-p:leading-relaxed">
            <ReactMarkdown>{article.description}</ReactMarkdown>
          </div>
          <div className="pt-8 flex flex-wrap gap-4 border-t border-border/50">
            <Button className="btn-gradient px-8" asChild>
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
              className={article.isBookmarked ? "bg-accent" : ""}
            >
              <Bookmark className={`mr-2 h-4 w-4 ${article.isBookmarked ? "fill-current" : ""}`} />
              {article.isBookmarked ? "Bookmarked" : "Bookmark"}
            </Button>
            <Button variant="outline">
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}