import { Globe, Monitor, User, MapPin, History, Server, HardDrive } from "lucide-react";

const fields = [
  { key: "src_ip", label: "Source IP", icon: Globe },
  { key: "dest_ip", label: "Destination IP", icon: Server },
  { key: "user", label: "User", icon: User },
  { key: "hostname", label: "Hostname", icon: Monitor },
  { key: "os", label: "OS", icon: HardDrive },
  { key: "endpoint_type", label: "Endpoint Type", icon: Monitor },
  { key: "geo", label: "Geo / Location", icon: MapPin },
  { key: "historical_pattern", label: "Historical Pattern", icon: History },
];

export default function ContextPanel({ contexts }) {
  if (!contexts) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 text-center">
        <p className="text-sm text-muted-foreground">No context data available</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Alert Context</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {fields.map(({ key, label, icon: Icon }) => {
          const value = contexts[key];
          if (!value) return null;
          return (
            <div key={key} className="bg-secondary/50 rounded-lg p-3 flex items-start gap-3">
              <Icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
                <p className="text-xs font-mono mt-0.5">{value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}