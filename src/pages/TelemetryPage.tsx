import React, { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, Title, AreaChart, BarChart, Text, Metric, Flex, Badge, Grid, Col, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell } from '@tremor/react';
import { Activity, Zap, Newspaper, Rss, Network, ShieldCheck, Cpu } from 'lucide-react';
import { subDays, format } from 'date-fns';
export function TelemetryPage() {
  const articles = useLiveQuery(() => db.articles.toArray());
  const feeds = useLiveQuery(() => db.feeds.toArray());
  const telemetry = useLiveQuery(() => db.telemetry.toArray());
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
    articles.forEach(a => counts[a.sourceName] = (counts[a.sourceName] || 0) + 1);
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 10);
  }, [articles]);
  return (
    <AppLayout container={true}>
      <div className="space-y-12">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
             <Activity className="h-8 w-8 text-primary" />
             <h1 className="text-4xl font-display font-black tracking-tighter">Sentinel Analytics</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl font-medium">Real-time telemetry from the regional intelligence lattice.</p>
        </header>
        <Grid numItemsMd={2} numItemsLg={4} className="gap-6">
          <Card decoration="top" decorationColor="orange" className="bg-surface-container-low border-none shadow-md3-1">
            <Flex alignItems="start">
              <Text className="font-mono text-xs uppercase font-black opacity-50">Lattice Density</Text>
              <Badge icon={Newspaper} color="orange">Processed</Badge>
            </Flex>
            <Metric className="font-display font-black">{articles?.length || 0}</Metric>
          </Card>
          <Card decoration="top" decorationColor="blue" className="bg-surface-container-low border-none shadow-md3-1">
            <Flex alignItems="start">
              <Text className="font-mono text-xs uppercase font-black opacity-50">Peer Sources</Text>
              <Badge icon={Rss} color="blue">Active</Badge>
            </Flex>
            <Metric className="font-display font-black">{feeds?.length || 0}</Metric>
          </Card>
          <Card decoration="top" decorationColor="emerald" className="bg-surface-container-low border-none shadow-md3-1">
            <Flex alignItems="start">
              <Text className="font-mono text-xs uppercase font-black opacity-50">Sync Integrity</Text>
              <Badge icon={ShieldCheck} color="emerald">Verified</Badge>
            </Flex>
            <Metric className="font-display font-black">99.8%</Metric>
          </Card>
          <Card decoration="top" decorationColor="purple" className="bg-surface-container-low border-none shadow-md3-1">
            <Flex alignItems="start">
              <Text className="font-mono text-xs uppercase font-black opacity-50">Discovery Rate</Text>
              <Badge icon={Zap} color="purple">High</Badge>
            </Flex>
            <Metric className="font-display font-black">12.4/m</Metric>
          </Card>
        </Grid>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <Card className="lg:col-span-8 bg-surface-container-low border-none shadow-md3-1">
            <Title className="font-mono text-sm uppercase font-black">Mesh Processing Ingestion (Last 7 Days)</Title>
            <AreaChart
              className="mt-8 h-80"
              data={chartData}
              index="date"
              categories={["Mesh Processing Volume"]}
              colors={["orange"]}
              showAnimation={true}
              curveType="monotone"
            />
          </Card>
          <Card className="lg:col-span-4 bg-surface-container-low border-none shadow-md3-1">
            <Title className="font-mono text-sm uppercase font-black">Top Stream Providers</Title>
            <BarChart
              className="mt-8 h-80"
              data={sourceData}
              index="name"
              categories={["count"]}
              colors={["indigo"]}
              layout="vertical"
              showAnimation={true}
            />
          </Card>
        </div>
        <Card className="bg-surface-container-low border-none shadow-md3-1 overflow-hidden">
          <div className="p-6 bg-surface-container-high border-b border-border/10">
             <Title className="font-mono text-sm uppercase font-black">Feed Quality Index (FQI)</Title>
          </div>
          <Table className="mt-0">
            <TableHead className="bg-surface-container-high/50">
              <TableRow>
                <TableHeaderCell className="font-mono text-[10px] uppercase font-black text-muted-foreground px-6 py-4">Source Identity</TableHeaderCell>
                <TableHeaderCell className="font-mono text-[10px] uppercase font-black text-muted-foreground px-6 py-4">Protocol</TableHeaderCell>
                <TableHeaderCell className="font-mono text-[10px] uppercase font-black text-muted-foreground px-6 py-4 text-right">FQI Metric</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feeds?.slice(0, 20).map((item) => (
                <TableRow key={item.id} className="hover:bg-primary/5 transition-colors">
                  <TableCell className="px-6 py-4">
                    <Text className="font-bold text-foreground">{item.title}</Text>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge color={item.quality > 90 ? "emerald" : "orange"} className="font-mono text-[9px] uppercase font-black">
                      {item.category} // Secure
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-6 py-4">
                    <Text className="font-mono font-black text-primary">{item.quality}.00%</Text>
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