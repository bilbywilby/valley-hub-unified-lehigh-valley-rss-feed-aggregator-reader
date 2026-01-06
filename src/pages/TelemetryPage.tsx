import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, Title, AreaChart, BarChart, Text, Metric, Flex, Badge } from '@tremor/react';
import { Activity, Zap, Newspaper, Rss } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { subDays, format, startOfDay } from 'date-fns';
export function TelemetryPage() {
  const articles = useLiveQuery(() => db.articles.toArray());
  const feeds = useLiveQuery(() => db.feeds.toArray());
  const telemetry = useLiveQuery(() => db.telemetry.toArray());
  // Aggregate data for charts
  const chartData = React.useMemo(() => {
    if (!articles) return [];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), i);
      return format(d, 'MMM dd');
    }).reverse();
    return last7Days.map(day => {
      const count = articles.filter(a => format(new Date(a.pubDate), 'MMM dd') === day).length;
      return { date: day, "Articles Processed": count };
    });
  }, [articles]);
  const sourceData = React.useMemo(() => {
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
      <div className="space-y-12">
        <header>
          <h1 className="text-4xl font-display font-bold">Network Telemetry</h1>
          <p className="text-muted-foreground mt-2">Insights into your local RSS stream performance.</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card decoration="top" decorationColor="orange">
            <Flex alignItems="start">
              <Text>Total Articles</Text>
              <Badge icon={Newspaper}>Local</Badge>
            </Flex>
            <Metric>{articles?.length || 0}</Metric>
          </Card>
          <Card decoration="top" decorationColor="blue">
            <Flex alignItems="start">
              <Text>Active Feeds</Text>
              <Badge icon={Rss}>Sources</Badge>
            </Flex>
            <Metric>{feeds?.length || 0}</Metric>
          </Card>
          <Card decoration="top" decorationColor="emerald">
            <Flex alignItems="start">
              <Text>Sync Events</Text>
              <Badge icon={Zap}>Realtime</Badge>
            </Flex>
            <Metric>{telemetry?.length || 0}</Metric>
          </Card>
          <Card decoration="top" decorationColor="purple">
            <Flex alignItems="start">
              <Text>Network Status</Text>
              <Badge icon={Activity}>Stable</Badge>
            </Flex>
            <Metric>98.2%</Metric>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-none shadow-soft">
            <Title>Ingestion Velocity (Last 7 Days)</Title>
            <AreaChart
              className="mt-4 h-72"
              data={chartData}
              index="date"
              categories={["Articles Processed"]}
              colors={["orange"]}
            />
          </Card>
          <Card className="border-none shadow-soft">
            <Title>Top News Sources</Title>
            <BarChart
              className="mt-4 h-72"
              data={sourceData}
              index="name"
              categories={["count"]}
              colors={["indigo"]}
              layout="vertical"
            />
          </Card>
        </div>
        <Card className="border-none shadow-soft">
          <Title>Feed Quality Index</Title>
          <ScrollArea className="h-96 mt-6 pr-4">
            <div className="space-y-4">
            {feeds?.map(feed => (
              <div key={feed.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${feed.quality > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="font-medium">{feed.title}</span>
                </div>
                <div className="flex items-center gap-4">
                  <Text className="text-xs">{feed.category}</Text>
                  <Metric className="text-sm">{feed.quality}%</Metric>
                </div>
              </div>
            ))}
          </div>
          </ScrollArea>
        </Card>
      </div>
    </AppLayout>
  );
}