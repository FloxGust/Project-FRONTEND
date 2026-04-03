import { cn } from "@/lib/utils";

const TACTIC_ORDER = [
  "Initial Access", "Execution", "Persistence", "Privilege Escalation",
  "Defense Evasion", "Credential Access", "Discovery", "Lateral Movement",
  "Collection", "Command and Control", "Exfiltration", "Impact"
];

export default function MitreMap({ agentResults }) {
  const tactics = {};
  agentResults.forEach(r => {
    const tactic = r.result?.mitre_tactic;
    const technique = r.result?.mitre_technique;
    if (tactic && technique) {
      if (!tactics[tactic]) tactics[tactic] = {};
      tactics[tactic][technique] = (tactics[tactic][technique] || 0) + 1;
    }
  });

  const activeTactics = TACTIC_ORDER.filter(t => tactics[t]);

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-4">MITRE ATT&CK Coverage</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {TACTIC_ORDER.map((tactic) => {
          const isActive = !!tactics[tactic];
          const techniques = tactics[tactic] ? Object.entries(tactics[tactic]) : [];
          return (
            <div
              key={tactic}
              className={cn(
                "rounded-lg p-2.5 border transition-all",
                isActive 
                  ? "bg-primary/10 border-primary/30 glow-cyan" 
                  : "bg-secondary/30 border-border/50 opacity-40"
              )}
            >
              <p className={cn(
                "text-[10px] font-semibold uppercase tracking-wide mb-1",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {tactic}
              </p>
              {techniques.map(([tech, count]) => (
                <div key={tech} className="flex items-center gap-1 mt-1">
                  <span className="text-[10px] font-mono text-foreground">{tech}</span>
                  <span className="text-[9px] text-muted-foreground">×{count}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}