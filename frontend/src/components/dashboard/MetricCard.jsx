import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function MetricCard({ icon: Icon, label, value, change, changeType, className, glowClass }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all duration-300",
        glowClass,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {change !== undefined && (
            <p className={cn(
              "text-xs font-medium",
              changeType === "up" ? "text-destructive" : "text-green-500"
            )}>
              {changeType === "up" ? "↑" : "↓"} {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        )}
      </div>
    </motion.div>
  );
}