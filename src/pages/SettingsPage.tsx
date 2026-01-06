import React, { useRef, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Shield, Fingerprint, Database, Trash2, Copy, Cpu, Activity, Info } from 'lucide-react';
import { toast } from 'sonner';
export function SettingsPage() {
  const identity = useLiveQuery(() => db.identity.toCollection().first());
  const geoEnabled = useLiveQuery(() => db.settings.get('geo_jitter_enabled'))?.value ?? true;
  const telemetryEnabled = useLiveQuery(() => db.settings.get('telemetry_enabled'))?.value ?? true;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    // Simple jitter visualization
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f38020';
    for (let i = 0; i < 50; i++) {
      const x = width / 2 + (Math.random() - 0.5) * 40;
      const y = height / 2 + (Math.random() - 0.5) * 40;
      ctx.globalAlpha = 1 - (Math.hypot(x - width/2, y - height/2) / 30);
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [geoEnabled]);
  const toggleSetting = async (key: string, current: boolean) => {
    await db.settings.put({ key, value: !current });
    toast.success(`Module ${key.replace(/_/g, ' ')} updated`);
  };
  const clearCache = async () => {
    if (confirm("Initiate article cache purge?")) {
      await db.articles.clear();
      toast.success("Cache invalidated successfully");
    }
  };
  return (
    <AppLayout container={true}>
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
             <Cpu className="h-8 w-8 text-primary" />
             <h1 className="text-4xl font-display font-black tracking-tighter">System Diagnostics</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl font-medium">Manage cryptographic identity and mesh privacy parameters.</p>
        </header>
        <div className="grid grid-cols-1 gap-8">
          {/* Cryptographic Identity Manifest */}
          <Card className="bg-surface-container-low border-none shadow-md3-2 rounded-4xl overflow-hidden">
            <CardHeader className="bg-surface-container-high/50 p-8 border-b border-border/10">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2 font-display font-black uppercase text-sm tracking-widest text-primary">
                    <Fingerprint className="h-5 w-5" />
                    Key Manifest
                  </CardTitle>
                  <CardDescription className="mt-2 text-muted-foreground font-medium">Unique NodeID backed by non-extractable P-256 secure enclave.</CardDescription>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[10px] uppercase tracking-widest px-4 py-2">Validated</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-3">
                 <Label className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">NodeID [B16 Hash]</Label>
                 <div className="p-4 bg-black/40 rounded-2xl flex items-center justify-between border border-border/10 font-mono text-sm">
                    <span className="text-primary truncate mr-4">{identity?.nodeId || "GENERATING..."}</span>
                    <Button variant="ghost" size="icon" onClick={() => {
                        navigator.clipboard.writeText(identity?.nodeId || '');
                        toast.success("NodeID Copied");
                    }} className="hover:bg-primary/10 hover:text-primary">
                      <Copy className="h-4 w-4" />
                    </Button>
                 </div>
              </div>
              <div className="space-y-3">
                 <Label className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">Public JWK Manifest</Label>
                 <div className="p-4 bg-black/20 rounded-2xl border border-border/10 font-mono text-[10px] text-muted-foreground h-32 overflow-y-auto leading-relaxed">
                    {identity?.publicJwk ? JSON.stringify(JSON.parse(identity.publicJwk), null, 2) : "// Loading identity..."}
                 </div>
              </div>
            </CardContent>
          </Card>
          {/* Privacy & Jitter Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <Card className="bg-surface-container-low border-none shadow-md3-1 rounded-4xl">
                <CardHeader className="p-8">
                  <CardTitle className="font-display font-black uppercase text-sm tracking-widest flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Geo-Anonymization
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-8">
                   <div className="flex items-center justify-between">
                      <div className="space-y-1">
                         <Label className="text-base font-bold">Lattice Jitter</Label>
                         <p className="text-xs text-muted-foreground">Poisson-noise coordinate injection.</p>
                      </div>
                      <Switch checked={geoEnabled} onCheckedChange={() => toggleSetting('geo_jitter_enabled', geoEnabled)} />
                   </div>
                   <div className="aspect-square bg-black/40 rounded-3xl border border-border/10 overflow-hidden relative flex items-center justify-center">
                      <canvas ref={canvasRef} width={200} height={200} className="w-full h-full opacity-60" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <span className="text-[8px] font-mono uppercase tracking-[0.4em] text-primary/40 font-black">Noise Distribution</span>
                      </div>
                   </div>
                </CardContent>
             </Card>
             <Card className="bg-surface-container-low border-none shadow-md3-1 rounded-4xl">
                <CardHeader className="p-8">
                  <CardTitle className="font-display font-black uppercase text-sm tracking-widest flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Protocol Telemetry
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-8">
                   <div className="flex items-center justify-between">
                      <div className="space-y-1">
                         <Label className="text-base font-bold">Signal Transmission</Label>
                         <p className="text-xs text-muted-foreground">Anonymous network health feedback.</p>
                      </div>
                      <Switch checked={telemetryEnabled} onCheckedChange={() => toggleSetting('telemetry_enabled', telemetryEnabled)} />
                   </div>
                   <div className="space-y-4 pt-4 border-t border-border/10">
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-2xl bg-surface-container-high flex items-center justify-center">
                            <Database className="h-5 w-5 text-muted-foreground" />
                         </div>
                         <div className="flex-1">
                            <div className="flex justify-between text-[10px] font-mono uppercase font-black mb-1">
                               <span>Cache Utilization</span>
                               <span className="text-primary">2.4 MB</span>
                            </div>
                            <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                               <div className="h-full w-[12%] bg-primary" />
                            </div>
                         </div>
                      </div>
                      <Button variant="outline" onClick={clearCache} className="w-full rounded-2xl h-12 font-black uppercase text-[10px] tracking-widest mt-4">
                        <Trash2 className="mr-2 h-4 w-4" /> Purge Local Cache
                      </Button>
                   </div>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
function Button({ children, onClick, variant = "primary", size = "default", className }: any) {
    const base = "inline-flex items-center justify-center rounded-md transition-colors disabled:opacity-50 focus:outline-none";
    const variants: any = {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
    };
    return (
        <button onClick={onClick} className={cn(base, variants[variant], className)}>
            {children}
        </button>
    );
}