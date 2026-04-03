import { Brain, Shield, Target, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const confidenceColors = {
  High: "text-green-400 bg-green-500/15 border-green-500/30",
  Medium: "text-yellow-400 bg-yellow-500/15 border-yellow-500/30",
  Low: "text-red-400 bg-red-500/15 border-red-500/30",
};

const agentIcons = {
  TypeAgent: Shield,
  ContextAgent: Target,
  InvestigationAgent: Brain,
};

export default function AIInsightPanel({ agentResults }) {
  if (!agentResults || agentResults.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-center">
        <Brain className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No AI analysis available for this alert</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {agentResults.map((result, idx) => {
        const Icon = agentIcons[result.agent_name] || Brain;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold">{result.agent_name}</p>
                  <p className="text-[10px] text-muted-foreground">{result.result?.classification_type}</p>
                </div>
              </div>
              <span className={cn(
                "text-[10px] font-semibold px-2 py-0.5 rounded border",
                confidenceColors[result.confidence]
              )}>
                {result.confidence}
              </span>
            </div>

            {result.result?.summary && (
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{result.result.summary}</p>
            )}

            {result.result?.mitre_tactic && (
              <div className="bg-secondary/50 rounded-lg p-2.5 mb-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">MITRE ATT&CK</p>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-primary font-mono">{result.result.mitre_tactic}</span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  <span className="font-mono">{result.result.mitre_technique}</span>
                  {result.result.mitre_sub_technique && (
                    <>
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground font-mono text-[10px]">{result.result.mitre_sub_technique}</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {result.result?.behavior_factors?.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Behavior Factors</p>
                <div className="flex flex-wrap gap-1">
                  {result.result.behavior_factors.map((f, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-secondary border border-border text-muted-foreground">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.result?.overall_verdict && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Verdict</p>
                <p className="text-xs font-medium text-foreground">{result.result.overall_verdict}</p>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}