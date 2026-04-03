import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, ChevronDown, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SeverityBadge from "../shared/SeverityBadge";
import StatusBadge from "../shared/StatusBadge";
import moment from "moment";
import { cn } from "@/lib/utils";

export default function AlertTable({ alerts, compact }) {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sortField, setSortField] = useState("detected_time");
  const [sortDir, setSortDir] = useState(-1);

  const sources = useMemo(() => [...new Set(alerts.map(a => a.log_source).filter(Boolean))], [alerts]);

  const filtered = useMemo(() => {
    let result = [...alerts];
    
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(a =>
        a.alert_name?.toLowerCase().includes(s) ||
        a.alert_id?.toLowerCase().includes(s) ||
        a.contexts?.src_ip?.toLowerCase().includes(s) ||
        a.contexts?.dest_ip?.toLowerCase().includes(s) ||
        a.contexts?.user?.toLowerCase().includes(s)
      );
    }
    if (severityFilter !== "all") result = result.filter(a => a.severity === severityFilter);
    if (statusFilter !== "all") result = result.filter(a => a.alert_status === statusFilter);
    if (sourceFilter !== "all") result = result.filter(a => a.log_source === sourceFilter);

    result.sort((a, b) => {
      const aVal = a[sortField] || "";
      const bVal = b[sortField] || "";
      return sortDir * (aVal > bVal ? 1 : aVal < bVal ? -1 : 0);
    });

    return result;
  }, [alerts, search, severityFilter, statusFilter, sourceFilter, sortField, sortDir]);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d * -1);
    else { setSortField(field); setSortDir(-1); }
  };

  const SortHeader = ({ field, children }) => (
    <button
      onClick={() => toggleSort(field)}
      className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
    >
      {children}
      {sortField === field && <ChevronDown className={cn("w-3 h-3 transition-transform", sortDir === 1 && "rotate-180")} />}
    </button>
  );

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Filters */}
      {!compact && (
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by name, IP, user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8 bg-secondary/50 text-xs"
            />
          </div>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-32 h-8 text-xs bg-secondary/50"><SelectValue placeholder="Severity" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 h-8 text-xs bg-secondary/50"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-32 h-8 text-xs bg-secondary/50"><SelectValue placeholder="Source" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {sources.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left"><SortHeader field="alert_id">ID</SortHeader></th>
              <th className="px-4 py-3 text-left"><SortHeader field="alert_name">Alert</SortHeader></th>
              <th className="px-4 py-3 text-left"><SortHeader field="severity">Severity</SortHeader></th>
              <th className="px-4 py-3 text-left"><SortHeader field="alert_status">Status</SortHeader></th>
              {!compact && <th className="px-4 py-3 text-left"><SortHeader field="log_source">Source</SortHeader></th>}
              {!compact && <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground">Context</th>}
              <th className="px-4 py-3 text-left"><SortHeader field="detected_time">Detected</SortHeader></th>
              <th className="px-4 py-3 text-center text-[10px] uppercase tracking-wider text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((alert) => (
              <tr
                key={alert.id}
                className={cn(
                  "border-b border-border/50 hover:bg-secondary/30 transition-colors",
                  alert.severity === "Critical" && alert.alert_status === "Open" && "bg-red-500/5"
                )}
              >
                <td className="px-4 py-3">
                  <span className="text-xs font-mono text-muted-foreground">{alert.alert_id}</span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium truncate max-w-[250px]">{alert.alert_name}</p>
                    {alert.tags?.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {alert.tags.slice(0, 3).map(t => (
                          <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3"><SeverityBadge severity={alert.severity} pulse={alert.alert_status === "Open"} /></td>
                <td className="px-4 py-3"><StatusBadge status={alert.alert_status} /></td>
                {!compact && (
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-muted-foreground">{alert.log_source}</span>
                  </td>
                )}
                {!compact && (
                  <td className="px-4 py-3">
                    <div className="text-[11px] font-mono space-y-0.5">
                      {alert.contexts?.src_ip && <p className="text-muted-foreground">src: <span className="text-foreground">{alert.contexts.src_ip}</span></p>}
                      {alert.contexts?.user && <p className="text-muted-foreground">usr: <span className="text-foreground">{alert.contexts.user}</span></p>}
                    </div>
                  </td>
                )}
                <td className="px-4 py-3">
                  <span className="text-xs text-muted-foreground">{alert.detected_time ? moment(alert.detected_time).fromNow() : "—"}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <Link to={`/alerts/${alert.id}`}>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={compact ? 5 : 8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No alerts found matching filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="px-4 py-2 border-t border-border flex justify-between items-center">
        <span className="text-[11px] text-muted-foreground">{filtered.length} of {alerts.length} alerts</span>
      </div>
    </div>
  );
}