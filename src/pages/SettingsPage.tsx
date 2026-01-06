import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Shield, Fingerprint, Database, Trash2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
export function SettingsPage() {
  const identity = useLiveQuery(() => db.identity.toCollection().first());
  const geoEnabled = useLiveQuery(() => db.settings.get('geo_jitter_enabled'))?.value ?? true;
  const telemetryEnabled = useLiveQuery(() => db.settings.get('telemetry_enabled'))?.value ?? true;
  const toggleSetting = async (key: string, current: boolean) => {
    await db.settings.put({ key, value: !current });
    toast.success(`Setting updated: ${key.replace(/_/g, ' ')}`);
  };
  const copyNodeId = () => {
    if (identity?.nodeId) {
      navigator.clipboard.writeText(identity.nodeId);
      toast.success("Node ID copied to clipboard");
    }
  };
  const clearCache = async () => {
    if (confirm("Clear all downloaded articles?")) {
      await db.articles.clear();
      toast.success("Article cache cleared");
    }
  };
  return (
    <AppLayout container={true}>
      <div className="max-w-4xl mx-auto space-y-12">
        <header>
          <h1 className="text-4xl font-display font-bold">Settings & Privacy</h1>
          <p className="text-muted-foreground mt-2">Manage your cryptographic identity and privacy preferences.</p>
        </header>
        <div className="space-y-8">
          {/* Identity Section */}
          <Card className="border-none shadow-soft overflow-hidden">
            <CardHeader className="bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <Fingerprint className="h-5 w-5 text-brand-orange" />
                Cryptographic Identity
              </CardTitle>
              <CardDescription>Your unique identifier in the Lehigh Valley decentralized mesh.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="p-4 bg-secondary/50 rounded-xl flex items-center justify-between border border-border/50">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Node ID</span>
                  <p className="font-mono text-sm break-all">{identity?.nodeId || 'Generating...'}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={copyNodeId}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground italic">
                This identity is backed by a non-extractable P-256 private key stored securely in your browser's hardware-backed storage.
              </p>
            </CardContent>
          </Card>
          {/* Privacy Controls */}
          <Card className="border-none shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-brand-orange" />
                Privacy Controls
              </CardTitle>
              <CardDescription>Control how your data is processed and shared.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Geo-Jitter Anonymization</Label>
                  <p className="text-sm text-muted-foreground">Adds random noise to your coordinates before transmission.</p>
                </div>
                <Switch checked={geoEnabled} onCheckedChange={() => toggleSetting('geo_jitter_enabled', geoEnabled)} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Share Anonymous Telemetry</Label>
                  <p className="text-sm text-muted-foreground">Helps us monitor feed health and improve local coverage.</p>
                </div>
                <Switch checked={telemetryEnabled} onCheckedChange={() => toggleSetting('telemetry_enabled', telemetryEnabled)} />
              </div>
            </CardContent>
          </Card>
          {/* Data Management */}
          <Card className="border-none shadow-soft border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-destructive" />
                Data Management
              </CardTitle>
              <CardDescription>Manage your local storage and cache.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button variant="outline" onClick={clearCache}>
                  <Trash2 className="mr-2 h-4 w-4" /> Clear Article Cache
                </Button>
                <Button variant="destructive" onClick={() => { if(confirm("RESET EVERYTHING?")) { db.delete(); window.location.reload(); } }}>
                  Reset All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}