import { cn } from "@/lib/utils";

const config = {
  Open: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "In Progress": "bg-purple-500/15 text-purple-400 border-purple-500/30",
  Closed: "bg-muted text-muted-foreground border-border",
};

export default function StatusBadge({ status }) {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border",
      config[status] || config.Open
    )}>
      {status}
    </span>
  );
}