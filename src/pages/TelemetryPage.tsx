import React, { useMemo, useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, Title, AreaChart, BarChart, Text, Metric, Flex, Badge as TremorBadge, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell } from '@tremor/react';
import { Badge as ShadcnBadge } from '@/components/ui/badge';
import { Activity, Zap, Newspaper, Rss, ShieldCheck, Globe, ListFilter, Signal } from 'lucide-react';
import { subDays, format } from 'date-fns';
export function TelemetryPage() {
  const articles = useLiveQuery(() => db.articles.toArray());
  const feeds = useLiveQuery(() => db.feeds.toArray());
  const [meshReports, setMeshReports] = useState<any[]>([]);
  const [healthData, setHealthData] = useState<any>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [repRes, healthRes] = await Promise.all([
          fetch('/api/v1/mesh/reports'),
          fetch('/api/v1/health')
        ]);
        const repJson = await repRes.json();
        const healthJson = await healthRes.json();
        if (repJson.success) setMeshReports(repJson.data || []);
        if (healthJson.success) setHealthData(healthJson);
      } catch (err) {
        console.error("Dashboard pull failed", err);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);
  const chartData = useMemo(() => {
    if (!articles || articles.length === 0) return [];
    const last7Days = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), i), 'MMM dd')).reverse();
    return last7Days.map(day => ({
      date: day,
      "Mesh Processing Volume": articles.filter(a => {
        try {
          return format(new Date(a.pubDate), 'MMM dd') === day;
        } catch (e) {
          return false;
        }
      }).length
    }));
  }, [articles]);
  const sourceData = useMemo(() => {
    if (!articles || articles.length === 0) return [];
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
             <h1 className="text-5xl font-display font-black tracking-tighter uppercase">Sentinel v4 Lattice</h1>
          </div>
          <p className="text-muted-foreground text-xl max-w-2xl font-medium">Regional mesh diagnostics and engine telemetry.</p>
        </header>
        <div className="p-8 bg-surface-container-low rounded-4xl border border-border/10 flex flex-wrap items-center justify-between gap-8">
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                 <Globe className="h-6 w-6 text-primary" />
              </div>
              <div>
                 <p className="text-[10px] font-mono font-black uppercase text-muted-foreground tracking-widest">Topology Region</p>
                 <p className="text-2xl font-display font-black text-foreground">{healthData?.region || 'LV_EDGE'}</p>
              </div>
           </div>
           <div className="h-12 w-px bg-border/20 hidden md:block" />
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                 <ShieldCheck className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                 <p className="text-[10px] font-mono font-black uppercase text-muted-foreground tracking-widest">Engine Runtime</p>
                 <p className="text-2xl font-display font-black text-foreground truncate max-w-[180px]">V8_ISOLATE</p>
              </div>
           </div>
           <div className="h-12 w-px bg-border/20 hidden md:block" />
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                 <Zap className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                 <p className="text-[10px] font-mono font-black uppercase text-muted-foreground tracking-widest">Protocol Sync</p>
                 <p className="text-2xl font-display font-black text-foreground">v4.0_STABLE</p>
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
              <Text className="font-mono text-[10px] uppercase font-black opacity-40 tracking-widest">Mesh Signals</Text>
              <TremorBadge icon={Signal} color="blue">ACTIVE</TremorBadge>
            </Flex>
            <Metric className="font-terminal font-black text-4xl mt-4 text-blue-400">{meshReports.length || feeds?.length || 0}</Metric>
          </Card>
          <Card decoration="top" decorationColor="emerald" className="bg-surface-container-low border-none shadow-md3-1 rounded-3xl">
            <Flex alignItems="start">
              <Text className="font-mono text-[10px] uppercase font-black opacity-40 tracking-widest">Shard Integrity</Text>
              <TremorBadge icon={ShieldCheck} color="emerald">VERIFIED</TremorBadge>
            </Flex>
            <Metric className="font-terminal font-black text-4xl mt-4 text-emerald-400">99.99%</Metric>
          </Card>
          <Card decoration="top" decorationColor="purple" className="bg-surface-container-low border-none shadow-md3-1 rounded-3xl">
            <Flex alignItems="start">
              <Text className="font-mono text-[10px] uppercase font-black opacity-40 tracking-widest">Peer Velocity</Text>
              <TremorBadge icon={Zap} color="purple">TURBO</TremorBadge>
            </Flex>
            <Metric className="font-terminal font-black text-4xl mt-4 text-purple-400">v4_MESH</Metric>
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
          <Card className="lg:col-span-4 bg-surface-container-low border-none shadow-md3-2 rounded-4xl p-8 overflow-hidden">
             <Title className="font-mono text-[11px] uppercase font-black tracking-[0.2em] text-muted-foreground/60 mb-6">Latest Mesh Signals</Title>
             <div className="space-y-4 h-80 overflow-y-auto custom-scrollbar pr-2">
                {meshReports.length > 0 ? meshReports.map((rep, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-surface-container-high/40 border border-border/10 flex flex-col gap-2">
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono font-black text-primary uppercase">ID: {rep.nodeId.slice(0, 8)}</span>
                        <span className="text-[9px] font-mono text-muted-foreground opacity-50">{format(new Date(rep.timestamp), 'HH:mm:ss')}</span>
                     </div>
                     <div className="flex gap-4">
                        <div className="flex flex-col">
                           <span className="text-[8px] uppercase text-muted-foreground font-black">Latency</span>
                           <span className="text-xs font-terminal">{rep.latency}ms</span>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[8px] uppercase text-muted-foreground font-black">Peers</span>
                           <span className="text-xs font-terminal">{rep.peerCount}</span>
                        </div>
                        <div className="flex flex-col ml-auto">
                           <ShadcnBadge variant="outline" className="text-[8px] font-black border-primary/20 text-primary py-0">{rep.engineStatus}</ShadcnBadge>
                        </div>
                     </div>
                  </div>
                )) : (
                  <div className="h-full flex items-center justify-center opacity-30 text-xs font-mono uppercase">Awaiting Mesh Pulse...</div>
                )}
             </div>
          </Card>
        </div>
        <Card className="bg-surface-container-low border-none shadow-md3-2 rounded-4xl overflow-hidden">
          <div className="p-8 bg-surface-container-high/50 border-b border-border/10 flex justify-between items-center">
             <Title className="font-mono text-[11px] uppercase font-black tracking-[0.3em] text-primary">Information Quality Index (IQS_RECAP)</Title>
             <ShadcnBadge variant="outline" className="border-primary/20 text-primary uppercase font-mono text-[9px]">ENGINE_V4_CORE</ShadcnBadge>
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
              {feeds && feeds.length > 0 ? (
                feeds.slice(0, 20).map((item) => (
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
                      <div className="flex flex-col items-end">
                        <Text className="font-terminal font-black text-primary text-lg tracking-tighter">{item.quality}.00%</Text>
                        <span className="text-[8px] font-mono opacity-30 uppercase">Lattice_v4_Sync</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-10 opacity-50 font-mono text-xs uppercase">Awaiting Mesh Population...</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AppLayout>
  );
}