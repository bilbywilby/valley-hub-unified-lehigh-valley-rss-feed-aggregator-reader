import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, ChevronRight, ArrowLeft, Hash, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { DOCS_LIST, DOCS_MAP } from '@shared/docs-content';
import { cn } from '@/lib/utils';
export function DocsPage() {
  const { slug } = useParams<{ slug?: string }>();
  const [search, setSearch] = useState('');
  const filteredDocs = useMemo(() => {
    return DOCS_LIST.filter(doc =>
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);
  const activeDoc = slug ? DOCS_MAP[slug] : null;
  return (
    <AppLayout container={true}>
      <div className="space-y-12">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
             <BookOpen className="h-8 w-8 text-primary" />
             <h1 className="text-4xl font-display font-black tracking-tighter">Documentation Wiki</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl font-medium">Technical specifications, mesh protocols, and system architecture.</p>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Wiki Index Rail */}
          <aside className={cn("lg:col-span-4 space-y-6", slug && "hidden lg:block")}>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Query system docs..."
                className="pl-12 h-14 rounded-3xl bg-surface-container-low border-none shadow-md3-1 focus-visible:ring-primary focus-visible:ring-offset-0"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              {filteredDocs.map((doc) => (
                <Link key={doc.slug} to={`/docs/${doc.slug}`}>
                  <Card className={cn(
                    "group cursor-pointer transition-all duration-300 border-none rounded-3xl p-5 relative overflow-hidden",
                    slug === doc.slug ? 'bg-primary/10 shadow-md3-2 border-l-4 border-l-primary' : 'bg-surface-container-low hover:bg-surface-container-high hover:shadow-md3-1'
                  )}>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="text-[9px] font-mono font-black uppercase tracking-widest px-2 py-0.5 border-border/10 text-muted-foreground">
                        {doc.category}
                      </Badge>
                      <ChevronRight className={cn("h-4 w-4 transition-transform", slug === doc.slug ? 'text-primary translate-x-1' : 'text-muted-foreground/30')} />
                    </div>
                    <h3 className={cn("text-lg font-bold tracking-tight mb-1", slug === doc.slug ? 'text-primary' : '')}>{doc.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{doc.description}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </aside>
          {/* Detailed Content Pane */}
          <main className={cn("lg:col-span-8 flex flex-col gap-6", !slug && "hidden lg:flex")}>
            {activeDoc ? (
              <Card className="bg-surface-container-low border-none shadow-md3-3 rounded-5xl overflow-hidden min-h-[70vh]">
                 <div className="p-1 px-8 pt-8 lg:px-12 lg:pt-12 bg-surface-container-high/30 border-b border-border/5">
                    <div className="flex items-center justify-between mb-10">
                      {slug && (
                        <Link to="/docs" className="lg:hidden flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                          <ArrowLeft className="h-4 w-4" /> Index
                        </Link>
                      )}
                      <div className="flex items-center gap-4 text-[9px] font-mono font-black uppercase tracking-widest text-muted-foreground opacity-50">
                         <span>v14.0.0</span>
                         <span>//</span>
                         <span>SECURE_READ</span>
                      </div>
                    </div>
                    <div className="space-y-2 mb-8">
                       <h2 className="text-4xl font-display font-black tracking-tighter">{activeDoc.title}</h2>
                       <p className="text-muted-foreground font-medium">{activeDoc.description}</p>
                    </div>
                 </div>
                 <div className="p-8 lg:p-12 pt-10">
                    <article className="prose prose-neutral dark:prose-invert prose-lg max-w-none prose-headings:font-display prose-headings:font-black prose-headings:tracking-tight prose-a:text-primary prose-a:font-bold prose-code:text-primary prose-pre:bg-black/40 prose-pre:rounded-3xl prose-pre:border prose-pre:border-border/10">
                      <ReactMarkdown>{activeDoc.content}</ReactMarkdown>
                    </article>
                 </div>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center py-48 text-center space-y-8 bg-surface-container-low rounded-5xl border-2 border-dashed border-border/10 h-full">
                <div className="w-24 h-24 bg-surface-container-high rounded-full flex items-center justify-center shadow-md3-1">
                  <Hash className="h-10 w-10 text-primary opacity-20" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase tracking-widest">Select Protocol</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto text-sm">Access the core specifications of the Lehigh Valley Mesh Node.</p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </AppLayout>
  );
}