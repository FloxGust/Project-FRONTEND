import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

const COLORS = ["#06b6d4", "#8b5cf6", "#22c55e", "#f97316", "#ec4899"];

export default function SourceChart({ alerts }) {
  const data = Object.entries(
    alerts.reduce((acc, a) => {
      const src = a.log_source || "unknown";
      acc[src] = (acc[src] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">By Log Source</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 8 }}>
            <XAxis type="number" hide />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={70} 
              tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(222 44% 8%)",
                border: "1px solid hsl(222 25% 16%)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "hsl(210 40% 96%)",
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}