import React, { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, Title, AreaChart, BarChart, Text, Metric, Flex, Badge as TremorBadge, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell } from '@tremor/react';
import { Badge as ShadcnBadge } from '@/components/ui/badge';
import { Activity, Zap, Newspaper, Rss, ShieldCheck, Globe } from 'lucide-react';
import { subDays, format } from 'date-fns';
import { cn } from '@/lib/utils';
export function TelemetryPage() {
  const articles = useLiveQuery(() => db.articles.toArray());
  const feeds = useLiveQuery(() => db.feeds.toArray());
  const chartData = useMemo(() => {
    if (!articles) return [];
    const last7Days = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), i), 'MMM dd')).reverse();
    return last7Days.map(day => ({
      date: day,
      "Mesh Processing Volume": articles.filter(a => format(new Date(a.pubDate), 'MMM dd') === day).length
    }));
  }, [articles]);
  const sourceData = useMemo(() => {
    if (!articles) return [];
    const counts: Record<string, number> = {};
    articles.forEach(a => {
      counts[a.sourceName] = (counts[a.sourceName] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [articles]);
  return (
    <AppLayout container={true}>
      <div className="space-y-12 pb-20">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
             <Activity className="h-10 w-10 text-primary" />
             <h1 className="text-5xl font-display font-black tracking-tighter uppercase">Sentinel v2 Intelligence</h1>
          </div>
          <p className="text-muted-foreground text-xl max-w-2xl font-medium">Real-time telemetry and network health metrics.</p>
        </header>
        <div className="p-8 bg-surface-container-low rounded-4xl border border-border/10 flex flex-wrap items-center justify-between gap-8">
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                 <Globe className="h-6 w-6 text-primary" />
              </div>
              <div>
                 <p className="text-[10px] font-mono font-black uppercase text-muted-foreground tracking-widest">Topology Health</p>
                 <p className="text-2xl font-display font-black text-foreground">LV_OPTIMIZED</p>
              </div>
           </div>
           <div className="h-12 w-px bg-border/20 hidden md:block" />
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                 <ShieldCheck className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                 <p className="text-[10px] font-mono font-black uppercase text-muted-foreground tracking-widest">Enclave Integrity</p>
                 <p className="text-2xl font-display font-black text-foreground">SHARD_SECURE</p>
              </div>
           </div>
           <div className="h-12 w-px bg-border/20 hidden md:block" />
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                 <Zap className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                 <p className="text-[10px] font-mono font-black uppercase text-muted-foreground tracking-widest">Sync Velocity</p>
                 <p className="text-2xl font-display font-black text-foreground">1.4s / REACH</p>
              </div>
           </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card decoration="top" decorationColor="orange" className="bg-surface-container-low border-none shadow-md3-1 rounded-3xl">
            <Flex alignItems="start">
              <Text className="font-mono text-[10px] uppercase font-black opacity-40 tracking-widest">Registry Density</Text>
              <TremorBadge icon={Newspaper} color="orange">INGESTED</TremorBadge>
            </Flex>
            <Metric className="font-terminal font-black text-4xl mt-4 text-primary">{articles?.length || 0}</Metric>
          </Card>
          <Card decoration="top" decorationColor="blue" className="bg-surface-container-low border-none shadow-md3-1 rounded-3xl">
            <Flex alignItems="start">
              <Text className="font-mono text-[10px] uppercase font-black opacity-40 tracking-widest">Lattice Nodes</Text>
              <TremorBadge icon={Rss} color="blue">ACTIVE</TremorBadge>
            </Flex>
            <Metric className="font-terminal font-black text-4xl mt-4 text-blue-400">{feeds?.length || 0}</Metric>
          </Card>
          <Card decoration="top" decorationColor="emerald" className="bg-surface-container-low border-none shadow-md3-1 rounded-3xl">
            <Flex alignItems="start">
              <Text className="font-mono text-[10px] uppercase font-black opacity-40 tracking-widest">Mesh Stability</Text>
              <TremorBadge icon={ShieldCheck} color="emerald">STABLE</TremorBadge>
            </Flex>
            <Metric className="font-terminal font-black text-4xl mt-4 text-emerald-400">99.98%</Metric>
          </Card>
          <Card decoration="top" decorationColor="purple" className="bg-surface-container-low border-none shadow-md3-1 rounded-3xl">
            <Flex alignItems="start">
              <Text className="font-mono text-[10px] uppercase font-black opacity-40 tracking-widest">Throughput</Text>
              <TremorBadge icon={Zap} color="purple">TURBO</TremorBadge>
            </Flex>
            <Metric className="font-terminal font-black text-4xl mt-4 text-purple-400">42 Mb/s</Metric>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <Card className="lg:col-span-8 bg-surface-container-low border-none shadow-md3-2 rounded-4xl p-8">
            <Title className="font-mono text-[11px] uppercase font-black tracking-[0.2em] text-muted-foreground/60 mb-6">Regional Ingestion History</Title>
            <AreaChart
              className="mt-8 h-80 terminal-text"
              data={chartData}
              index="date"
              categories={["Mesh Processing Volume"]}
              colors={["orange"]}
              showAnimation={true}
              showGridLines={false}
            />
          </Card>
          <Card className="lg:col-span-4 bg-surface-container-low border-none shadow-md3-2 rounded-4xl p-8">
            <Title className="font-mono text-[11px] uppercase font-black tracking-[0.2em] text-muted-foreground/60 mb-6">Top Stream Providers</Title>
            <BarChart
              className="mt-8 h-80 terminal-text"
              data={sourceData}
              index="name"
              categories={["count"]}
              colors={["indigo"]}
              layout="vertical"
              showAnimation={true}
              showGridLines={false}
            />
          </Card>
        </div>
        <Card className="bg-surface-container-low border-none shadow-md3-2 rounded-4xl overflow-hidden">
          <div className="p-8 bg-surface-container-high/50 border-b border-border/10 flex justify-between items-center">
             <Title className="font-mono text-[11px] uppercase font-black tracking-[0.3em] text-primary">Information Quality Index (IQS_RECAP)</Title>
             <ShadcnBadge variant="outline" className="border-primary/20 text-primary uppercase font-mono text-[9px]">v14.2.1</ShadcnBadge>
          </div>
          <Table className="mt-0">
            <TableHead className="bg-surface-container-high/30">
              <TableRow>
                <TableHeaderCell className="font-mono text-[10px] uppercase font-black text-muted-foreground px-8 py-6">Source Node Identity</TableHeaderCell>
                <TableHeaderCell className="font-mono text-[10px] uppercase font-black text-muted-foreground px-8 py-6">Registry Protocol</TableHeaderCell>
                <TableHeaderCell className="font-mono text-[10px] uppercase font-black text-muted-foreground px-8 py-6 text-right">IQS Metric</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feeds?.slice(0, 20).map((item) => (
                <TableRow key={item.id} className="hover:bg-primary/5 transition-all group">
                  <TableCell className="px-8 py-5">
                    <Text className="font-bold text-foreground group-hover:text-primary transition-colors">{item.title}</Text>
                  </TableCell>
                  <TableCell className="px-8 py-5">
                    <TremorBadge color={item.quality > 90 ? "emerald" : "orange"} className="font-mono text-[9px] uppercase font-black tracking-tighter">
                      {item.category} // SECURE_SHARD
                    </TremorBadge>
                  </TableCell>
                  <TableCell className="text-right px-8 py-5">
                    <Text className="font-terminal font-black text-primary text-lg tracking-tighter">{item.quality}.00%</Text>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AppLayout>
  );
}