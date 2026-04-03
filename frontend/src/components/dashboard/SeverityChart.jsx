import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = {
  Critical: "#ef4444",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#06b6d4",
};

export default function SeverityChart({ alerts }) {
  const data = Object.entries(
    alerts.reduce((acc, a) => {
      acc[a.severity] = (acc[a.severity] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Alerts by Severity</h3>
      <div className="h-48 flex items-center">
        <ResponsiveContainer width="50%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={65}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "hsl(222 44% 8%)",
                border: "1px solid hsl(222 25% 16%)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "hsl(210 40% 96%)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-2">
          {data.map((d) => (
            <div key={d.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[d.name] }} />
                <span className="text-muted-foreground">{d.name}</span>
              </div>
              <span className="font-semibold">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}