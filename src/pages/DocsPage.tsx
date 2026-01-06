import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, ChevronRight, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { DOCS_LIST, DOCS_MAP } from '@shared/docs-content';
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
      <div className="space-y-10">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-display font-bold">Documentation Wiki</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Technical specifications, privacy protocols, and the regional roadmap.
          </p>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar / List View */}
          <aside className={`${slug ? 'hidden lg:block' : 'block'} lg:col-span-4 space-y-6`}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search wiki..." 
                className="pl-10 h-12 rounded-2xl bg-surface-container border-none shadow-md3-1 focus-visible:ring-primary"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              {filteredDocs.map((doc) => (
                <Link key={doc.slug} to={`/docs/${doc.slug}`}>
                  <Card className={`group cursor-pointer transition-all duration-300 border-none mb-3 ${slug === doc.slug ? 'bg-primary/10 shadow-md3-2' : 'bg-surface-container-low hover:bg-surface-container hover:shadow-md3-1'}`}>
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest opacity-60">
                          {doc.category}
                        </Badge>
                        <ChevronRight className={`h-4 w-4 transition-transform ${slug === doc.slug ? 'text-primary translate-x-1' : 'text-muted-foreground'}`} />
                      </div>
                      <CardTitle className={`text-lg ${slug === doc.slug ? 'text-primary' : ''}`}>{doc.title}</CardTitle>
                      <CardDescription className="line-clamp-1">{doc.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </aside>
          {/* Detail View */}
          <main className={`${!slug ? 'hidden lg:flex' : 'flex'} lg:col-span-8 flex-col gap-6`}>
            {activeDoc ? (
              <Card className="border-none shadow-md3-2 bg-surface-container-low overflow-hidden rounded-4xl min-h-[60vh]">
                <div className="p-6 md:p-10 lg:p-12">
                  {slug && (
                    <Link to="/docs" className="lg:hidden flex items-center gap-2 text-sm font-bold text-primary mb-6">
                      <ArrowLeft className="h-4 w-4" /> Back to Wiki
                    </Link>
                  )}
                  <article className="prose prose-neutral dark:prose-invert prose-lg max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-primary">
                    <ReactMarkdown>{activeDoc.content}</ReactMarkdown>
                  </article>
                </div>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 bg-surface-container-low rounded-4xl border-2 border-dashed border-border/50">
                <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center shadow-md3-1">
                  <BookOpen className="h-10 w-10 text-primary/40" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Select a Topic</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto">Explore the inner workings of the Valley Hub mesh network.</p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </AppLayout>
  );
}