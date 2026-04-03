import { Target, Globe, User, Server } from "lucide-react";

function TopList({ icon: Icon, title, items }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5 text-primary" />
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{title}</span>
      </div>
      <div className="space-y-1.5">
        {items.slice(0, 3).map(([name, count], i) => (
          <div key={name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground w-3">{i + 1}.</span>
              <span className="font-mono text-foreground truncate max-w-[140px]">{name}</span>
            </div>
            <span className="text-muted-foreground">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function countBy(items, keyFn) {
  const counts = {};
  items.forEach(item => {
    const key = keyFn(item);
    if (key) counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

export default function ThreatIntelPanel({ alerts, agentResults }) {
  const topTechniques = countBy(agentResults, r => r.result?.mitre_technique);
  const topTags = countBy(alerts.flatMap(a => (a.tags || []).map(t => ({ tag: t }))), i => i.tag);
  const topSrcIP = countBy(alerts, a => a.contexts?.src_ip);
  const topUsers = countBy(alerts, a => a.contexts?.user);

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Threat Intelligence</h3>
      <div className="grid grid-cols-2 gap-4">
        <TopList icon={Target} title="Top MITRE Techniques" items={topTechniques} />
        <TopList icon={Globe} title="Top Attack Types" items={topTags} />
        <TopList icon={Server} title="Top Source IPs" items={topSrcIP} />
        <TopList icon={User} title="Top Users" items={topUsers} />
      </div>
    </div>
  );
}