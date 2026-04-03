import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export default function RawLogViewer({ rawLog }) {
  if (!rawLog) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider">Raw Log</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => {
            navigator.clipboard.writeText(rawLog);
            toast({ title: "Copied to clipboard" });
          }}
        >
          <Copy className="w-3 h-3" />
        </Button>
      </div>
      <pre className="bg-background rounded-lg p-3 text-[11px] font-mono text-green-400 overflow-x-auto leading-relaxed whitespace-pre-wrap break-all">
        {rawLog}
      </pre>
    </div>
  );
}