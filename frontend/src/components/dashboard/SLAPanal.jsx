import { Clock, AlertTriangle, Timer, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SLAPanel({ alerts }) {
  const withSLA = alerts.filter(a => a.sla);
  
  const avg = (key) => {
    const vals = withSLA.map(a => a.sla?.[key]).filter(v => v !== undefined && v > 0);
    if (vals.length === 0) return 0;
    return (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1);
  };

  const breached = withSLA.filter(a => a.sla?.mtta > 15 || a.sla?.mttr > 60).length;

  const metrics = [
    { label: "Avg MTTD", value: `${avg("mttd")}m`, icon: Zap, color: "text-cyan-400" },
    { label: "Avg MTTA", value: `${avg("mtta")}m`, icon: Timer, color: "text-purple-400" },
    { label: "Avg MTTR", value: `${avg("mttr")}m`, icon: Clock, color: "text-green-400" },
    { label: "SLA Breached", value: breached, icon: AlertTriangle, color: breached > 0 ? "text-red-400" : "text-green-400" },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-4">SOC Performance</h3>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="bg-secondary/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <m.icon className={cn("w-3.5 h-3.5", m.color)} />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{m.label}</span>
            </div>
            <p className="text-lg font-bold">{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}