import React, { useRef, useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Shield, Fingerprint, Database, Trash2, Copy, Cpu, Activity, ScrollText } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
export function SettingsPage() {
  const identity = useLiveQuery(() => db.identity.toCollection().first());
  const geoEnabled = useLiveQuery(() => db.settings.get('geo_jitter_enabled'))?.value ?? true;
  const telemetryEnabled = useLiveQuery(() => db.settings.get('telemetry_enabled'))?.value ?? true;
  const [logs, setLogs] = useState<string[]>([
    "Node Initialized: SIG_STABLE",
    "Identity Verified: ECDSA_P256",
    "Protocol Status: Online"
  ]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = geoEnabled ? '#f38020' : '#4ade80';
    for (let i = 0; i < 60; i++) {
      const centerX = width / 2;
      const centerY = height / 2;
      const x = centerX + (Math.random() - 0.5) * 80;
      const y = centerY + (Math.random() - 0.5) * 80;
      const distToMouse = Math.hypot(x - mousePos.x, y - mousePos.y);
      const repulsion = distToMouse < 40 ? (40 - distToMouse) * 0.5 : 0;
      const angle = Math.atan2(y - mousePos.y, x - mousePos.x);
      const fx = x + Math.cos(angle) * repulsion;
      const fy = y + Math.sin(angle) * repulsion;
      ctx.globalAlpha = 1 - (Math.hypot(fx - centerX, fy - centerY) / 60);
      ctx.beginPath();
      ctx.arc(fx, fy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [geoEnabled, mousePos]);
  const toggleSetting = async (key: string, current: boolean) => {
    await db.settings.put({ key, value: !current });
    setLogs(prev => [...prev, `Module ${key} updated: ${!current}`].slice(-8));
    toast.success(`Module ${key.replace(/_/g, ' ')} updated`);
  };
  return (
    <AppLayout container={true}>
      <div className="max-w-5xl mx-auto space-y-12 pb-20">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
             <Cpu className="h-10 w-10 text-primary" />
             <h1 className="text-5xl font-display font-black tracking-tighter uppercase">Manifest Diagnostics</h1>
          </div>
          <p className="text-muted-foreground text-xl max-w-2xl font-medium">Privacy parameters and cryptographic lattice identity.</p>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <Card className="lg:col-span-7 bg-surface-container-low border-none shadow-md3-3 rounded-4xl overflow-hidden">
            <CardHeader className="bg-surface-container-high/50 p-10 border-b border-border/10">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-3 font-display font-black uppercase text-xs tracking-[0.3em] text-primary">
                    <Fingerprint className="h-6 w-6" />
                    Key manifest v2
                  </CardTitle>
                  <CardDescription className="mt-4 text-lg text-muted-foreground font-medium">P-256 Non-Extractable Secure Enclave.</CardDescription>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[10px] uppercase tracking-widest px-5 py-2.5">SECURE_ACTIVE</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="space-y-4">
                 <Label className="text-[11px] font-mono font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">NodeID [B16_SHARD]</Label>
                 <div className="p-6 bg-black/50 rounded-2xl flex items-center justify-between border border-border/10 font-mono text-base group">
                    <span className="text-primary truncate mr-4">{identity?.nodeId || "GENERATING..."}</span>
                    <Button variant="ghost" size="icon" onClick={() => {
                        navigator.clipboard.writeText(identity?.nodeId || '');
                        toast.success("NodeID Copied");
                    }} className="hover:bg-primary/10 hover:text-primary transition-colors">
                      <Copy className="h-5 w-5" />
                    </Button>
                 </div>
              </div>
              <div className="space-y-4">
                 <Label className="text-[11px] font-mono font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">Identity Manifest [JWK]</Label>
                 <div className="p-6 bg-black/30 rounded-2xl border border-border/10 font-mono text-[11px] text-muted-foreground h-48 overflow-y-auto leading-relaxed custom-scrollbar">
                    {identity?.publicJwk ? JSON.stringify(JSON.parse(identity.publicJwk), null, 2) : "// Awaiting identity initialization..."}
                 </div>
              </div>
            </CardContent>
          </Card>
          <div className="lg:col-span-5 flex flex-col gap-8">
             <Card className="bg-surface-container-low border-none shadow-md3-1 rounded-4xl overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="font-display font-black uppercase text-xs tracking-widest flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Geo Anonymizer
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-6">
                   <div className="flex items-center justify-between p-4 bg-surface-container-high/50 rounded-2xl border border-border/5">
                      <div className="space-y-1">
                         <Label className="text-sm font-bold">Lattice Jitter</Label>
                         <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-tighter">POISSON_COORD_INJECTION</p>
                      </div>
                      <Switch checked={geoEnabled} onCheckedChange={() => toggleSetting('geo_jitter_enabled', geoEnabled)} />
                   </div>
                   <div 
                    className="aspect-video bg-black/60 rounded-3xl border border-border/10 overflow-hidden relative cursor-crosshair"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                    }}
                   >
                      <canvas ref={canvasRef} width={300} height={200} className="w-full h-full opacity-80" />
                      <div className="absolute top-4 left-4">
                         <span className="text-[8px] font-mono uppercase tracking-[0.3em] text-primary/60 font-black">Disturbance_Visualizer</span>
                      </div>
                   </div>
                </CardContent>
             </Card>
             <Card className="bg-surface-container-low border-none shadow-md3-1 rounded-4xl overflow-hidden flex flex-col h-full">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="font-display font-black uppercase text-xs tracking-widest flex items-center gap-2">
                    <ScrollText className="h-5 w-5 text-primary" />
                    Diagnostic Log
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8 flex-1">
                  <div className="bg-black/80 rounded-2xl border border-border/10 p-5 font-mono text-[10px] leading-relaxed h-48 overflow-y-auto custom-scrollbar">
                    {logs.map((log, i) => (
                      <div key={i} className="flex gap-3 mb-1">
                        <span className="text-muted-foreground opacity-30">[{new Date().toLocaleTimeString()}]</span>
                        <span className="text-emerald-500/80">{log}</span>
                      </div>
                    ))}
                    <div className="text-primary animate-pulse">_</div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={async () => {
                      if(confirm("Confirm regional cache purge?")) {
                        await db.articles.clear();
                        setLogs(prev => [...prev, "Cache Purged: Success"].slice(-8));
                        toast.success("Cache Invalidated");
                      }
                    }}
                    className="w-full rounded-2xl h-14 font-black uppercase text-[10px] tracking-widest mt-6 border-border/10 bg-surface-container-high/50"
                  >
                    <Trash2 className="mr-2 h-4 w-4 text-destructive" /> Flush Local Shard
                  </Button>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}