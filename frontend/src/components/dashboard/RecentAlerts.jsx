import { Link } from "react-router-dom";
import SeverityBadge from "../shared/SeverityBadge";
import StatusBadge from "../shared/StatusBadge";
import moment from "moment";
import { ExternalLink } from "lucide-react";

export default function RecentAlerts({ alerts }) {
  const recent = [...alerts]
    .sort((a, b) => new Date(b.detected_time || b.created_date) - new Date(a.detected_time || a.created_date))
    .slice(0, 5);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider">Recent Alerts</h3>
        <Link to="/alerts" className="text-[10px] text-primary hover:underline">View All →</Link>
      </div>
      <div className="divide-y divide-border/50">
        {recent.map((alert) => (
          <Link
            key={alert.id}
            to={`/alerts/${alert.id}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{alert.alert_name}</p>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                {alert.alert_id} • {alert.contexts?.src_ip || "—"}
              </p>
            </div>
            <SeverityBadge severity={alert.severity} />
            <StatusBadge status={alert.alert_status} />
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {alert.detected_time ? moment(alert.detected_time).fromNow() : "—"}
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}