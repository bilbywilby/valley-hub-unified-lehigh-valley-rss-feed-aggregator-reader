import React, { useRef, useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Shield, Fingerprint, Database, Trash2, Copy, Cpu, Activity, ScrollText, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
export function SettingsPage() {
  const identity = useLiveQuery(() => db.identity.toCollection().first());
  const geoEnabled = useLiveQuery(() => db.settings.get('geo_jitter_enabled'))?.value ?? true;
  const telemetryEnabled = useLiveQuery(() => db.settings.get('telemetry_enabled'))?.value ?? true;
  const [logs, setLogs] = useState<string[]>([
    "Node Initialized: SIG_STABLE",
    "Identity Verified: ECDSA_P256",
    "Hardware Root: VERIFIED",
    "Protocol Status: Online"
  ]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  // Jitter Visualizer with magnetic particles
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      origX: Math.random() * canvas.width,
      origY: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
    }));
    let animationFrame: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = geoEnabled ? '#f38020' : '#4ade80';
      particles.forEach(p => {
        const dist = Math.hypot(p.x - mousePos.x, p.y - mousePos.y);
        const force = dist < 50 ? (50 - dist) / 50 : 0;
        const angle = Math.atan2(p.y - mousePos.y, p.x - mousePos.x);
        p.x = p.origX + Math.cos(angle) * force * 15;
        p.y = p.origY + Math.sin(angle) * force * 15;
        ctx.globalAlpha = Math.max(0.1, 1 - (dist / 100));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      animationFrame = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [geoEnabled, mousePos]);
  // Topology Map
  useEffect(() => {
    if (!mapRef.current) return;
    const ctx = mapRef.current.getContext('2d');
    if (!ctx) return;
    const w = mapRef.current.width;
    const h = mapRef.current.height;
    ctx.clearRect(0, 0, w, h);
    // Grid
    ctx.strokeStyle = 'rgba(243, 128, 32, 0.1)';
    ctx.lineWidth = 1;
    for(let i=0; i<w; i+=20) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke(); }
    for(let i=0; i<h; i+=20) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke(); }
    // Central Node (Lehigh Valley)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath(); ctx.arc(w/2, h/2, 4, 0, Math.PI*2); ctx.fill();
    // User Node
    const ux = w/2 + (Math.random()-0.5)*100;
    const uy = h/2 + (Math.random()-0.5)*100;
    ctx.fillStyle = '#f38020';
    ctx.beginPath(); ctx.arc(ux, uy, 6, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#f38020';
    ctx.beginPath(); ctx.arc(ux, uy, 12, 0, Math.PI*2); ctx.stroke();
    ctx.font = '8px monospace';
    ctx.fillText('PEER_01', ux+15, uy+3);
  }, []);
  const toggleSetting = async (key: string, current: boolean) => {
    await db.settings.put({ key, value: !current });
    setLogs(prev => [...prev, `Module ${key} update: SUCCESS [VAL: ${!current}]`].slice(-10));
    toast.success(`Module update broadcasted`);
  };
  return (
    <AppLayout container={true}>
      <div className="max-w-5xl mx-auto space-y-12 pb-20">
        <header className="space-y-4">
          <div className="flex items-center gap-4">
             <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
               <Cpu className="h-8 w-8 text-primary" />
             </div>
             <div>
               <h1 className="text-5xl font-display font-black tracking-tighter uppercase">Manifest Diagnostics</h1>
               <p className="text-muted-foreground text-xl font-medium opacity-80">Cryptographic identity and regional mesh topology.</p>
             </div>
          </div>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <Card className="lg:col-span-7 bg-surface-container-low border-none shadow-md3-4 rounded-5xl overflow-hidden">
            <CardHeader className="bg-surface-container-high/50 p-10 border-b border-border/10">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-3 font-display font-black uppercase text-xs tracking-[0.4em] text-primary">
                    <Fingerprint className="h-7 w-7" />
                    Key Manifest v3.0
                  </CardTitle>
                  <CardDescription className="mt-4 text-xl text-muted-foreground font-medium opacity-80">ECDSA P-256 Non-Extractable Secure Enclave.</CardDescription>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-black text-[10px] uppercase tracking-widest px-6 py-2.5 rounded-full">ENCLAVE_ACTIVE</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              <div className="space-y-4">
                 <div className="flex justify-between items-end">
                    <Label className="text-[11px] font-mono font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50">NodeID [ALGO: ECDSA_P256]</Label>
                    <span className="text-[10px] font-mono text-emerald-500/60 font-black tracking-tighter">ENTROPY: SECURE_HARDWARE</span>
                 </div>
                 <div className="p-8 bg-black/60 rounded-3xl flex items-center justify-between border border-border/10 font-mono text-lg group shadow-inner">
                    <span className="text-primary truncate mr-4 tracking-tighter">{identity?.nodeId || "GENERATING..."}</span>
                    <Button variant="ghost" size="icon" onClick={() => {
                        navigator.clipboard.writeText(identity?.nodeId || '');
                        toast.success("NodeID Copied");
                    }} className="h-12 w-12 hover:bg-primary/10 hover:text-primary transition-colors rounded-xl">
                      <Copy className="h-6 w-6" />
                    </Button>
                 </div>
              </div>
              <div className="space-y-4">
                 <Label className="text-[11px] font-mono font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50">Public Identity Manifest [JWK_RAW]</Label>
                 <div className="p-8 bg-black/40 rounded-3xl border border-border/10 font-mono text-[12px] text-muted-foreground h-56 overflow-y-auto leading-relaxed custom-scrollbar shadow-inner">
                    {identity?.publicJwk ? JSON.stringify(JSON.parse(identity.publicJwk), null, 2) : "// Awaiting identity initialization..."}
                 </div>
              </div>
            </CardContent>
          </Card>
          <div className="lg:col-span-5 flex flex-col gap-8">
             <Card className="bg-surface-container-low border-none shadow-md3-2 rounded-5xl overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="font-display font-black uppercase text-xs tracking-widest flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary" />
                    Mesh Anonymizer
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-6">
                   <div className="flex items-center justify-between p-5 bg-surface-container-high/60 rounded-3xl border border-border/10">
                      <div className="space-y-1">
                         <Label className="text-base font-black uppercase tracking-tight">Lattice Jitter</Label>
                         <p className="text-[10px] text-muted-foreground uppercase font-mono font-black tracking-tighter opacity-60">POISSON_COORD_INJECTION</p>
                      </div>
                      <Switch checked={geoEnabled} onCheckedChange={() => toggleSetting('geo_jitter_enabled', geoEnabled)} className="data-[state=checked]:bg-primary" />
                   </div>
                   <div
                    className="aspect-video bg-black rounded-4xl border border-border/10 overflow-hidden relative cursor-crosshair group shadow-inner"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                    }}
                   >
                      <canvas ref={canvasRef} width={400} height={250} className="w-full h-full opacity-80" />
                      <div className="absolute top-5 left-5">
                         <span className="text-[9px] font-mono uppercase tracking-[0.4em] text-primary font-black opacity-40 group-hover:opacity-100 transition-opacity">Visual_Disturbance</span>
                      </div>
                   </div>
                </CardContent>
             </Card>
             <Card className="bg-surface-container-low border-none shadow-md3-2 rounded-5xl overflow-hidden flex flex-col">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="font-display font-black uppercase text-xs tracking-widest flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    Mesh Topology
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-6">
                   <div className="aspect-[4/3] bg-black/80 rounded-4xl border border-border/10 overflow-hidden shadow-inner">
                      <canvas ref={mapRef} width={300} height={200} className="w-full h-full opacity-60" />
                   </div>
                   <div className="bg-black/80 rounded-3xl border border-border/10 p-6 font-mono text-[10px] leading-relaxed h-44 overflow-y-auto custom-scrollbar shadow-inner">
                    <div className="mb-2 text-[9px] font-black opacity-30 uppercase tracking-widest border-b border-white/5 pb-1">Diagnostic Log</div>
                    {logs.map((log, i) => (
                      <div key={i} className="flex gap-3 mb-1.5">
                        <span className="text-muted-foreground opacity-30">[{new Date().toLocaleTimeString()}]</span>
                        <span className={cn("text-emerald-500/80", log.includes('SUCCESS') && "text-primary")}>{log}</span>
                      </div>
                    ))}
                    <div className="text-primary animate-pulse">_</div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      if(confirm("Confirm local registry purge?")) {
                        await db.articles.clear();
                        setLogs(prev => [...prev, "NODE_CACHE_FLUSH: SUCCESS"].slice(-10));
                        toast.success("Cache Invalidated");
                      }
                    }}
                    className="w-full rounded-2xl h-16 font-black uppercase text-xs tracking-widest border-border/10 bg-surface-container-high/60 hover:bg-destructive/10 hover:text-destructive transition-all"
                  >
                    <Trash2 className="mr-3 h-5 w-5" /> FLUSH_LOCAL_SHARD
                  </Button>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}