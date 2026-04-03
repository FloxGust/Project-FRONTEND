import { cn } from "@/lib/utils";

const config = {
  Critical: "bg-red-500/15 text-red-400 border-red-500/30",
  High: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Low: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
};

export default function SeverityBadge({ severity, pulse }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border uppercase tracking-wide",
      config[severity] || config.Low,
      pulse && severity === "Critical" && "animate-pulse-critical"
    )}>
      <span className={cn(
        "w-1.5 h-1.5 rounded-full",
        severity === "Critical" ? "bg-red-400" :
        severity === "High" ? "bg-orange-400" :
        severity === "Medium" ? "bg-yellow-400" : "bg-cyan-400"
      )} />
      {severity}
    </span>
  );
}