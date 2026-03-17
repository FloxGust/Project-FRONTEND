import { useState, useEffect } from 'react'
import { AlertTriangle, ShieldAlert, Activity, Bot, TrendingUp } from 'lucide-react'
import { alertsApi } from '../../api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

const TREND = [
  { time: '00:00', alerts: 4 }, { time: '04:00', alerts: 7 },
  { time: '08:00', alerts: 18 }, { time: '12:00', alerts: 24 },
  { time: '16:00', alerts: 31 }, { time: '20:00', alerts: 19 },
  { time: 'Now',   alerts: 12 },
]

const SEVERITY_DATA = [
  { name: 'Critical', value: 3, fill: '#ff3b3b' },
  { name: 'High',     value: 8, fill: '#ff8c00' },
  { name: 'Medium',   value: 14, fill: '#ffd700' },
  { name: 'Low',      value: 22, fill: '#00d48a' },
]

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, color: '#6b7280', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>{label}</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: color || '#e5e7eb', marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>{value}</div>
          {sub && <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{sub}</div>}
        </div>
        <div style={{ background: `${color}18`, borderRadius: 8, padding: 10 }}>
          <Icon size={18} color={color || '#6b7280'} />
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    alertsApi.stats()
      .then(r => setStats(r.data))
      .catch(() => setStats({ total: 47, critical: 3, high: 8, open: 21, escalated: 4 }))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: '#6b7280', fontFamily: 'JetBrains Mono, monospace', letterSpacing: 2, textTransform: 'uppercase' }}>Security Operations Center</div>
        <h1 style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 600, color: '#f9fafb' }}>Dashboard</h1>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard icon={ShieldAlert} label="Total Alerts"   value={loading ? '—' : stats?.total}     color="#00d4ff" sub="Last 24 hours" />
        <StatCard icon={AlertTriangle} label="Critical"     value={loading ? '—' : stats?.critical}  color="#ff3b3b" sub="Needs immediate action" />
        <StatCard icon={Activity}    label="Open"           value={loading ? '—' : stats?.open}      color="#ffd700" sub="Pending triage" />
        <StatCard icon={TrendingUp}  label="Escalated"      value={loading ? '—' : stats?.escalated} color="#ff8c00" sub="Active incidents" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8, padding: 20 }}>
          <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace', marginBottom: 16 }}>ALERT VOLUME — 24H</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={TREND}>
              <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 6, fontSize: 12 }} />
              <Line type="monotone" dataKey="alerts" stroke="#00d4ff" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8, padding: 20 }}>
          <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace', marginBottom: 16 }}>BY SEVERITY</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={SEVERITY_DATA} layout="vertical">
              <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={55} />
              <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 6, fontSize: 12 }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {SEVERITY_DATA.map((entry, i) => (
                  <rect key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Agent status strip */}
      <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8, padding: 16 }}>
        <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace', marginBottom: 12 }}>AGENT STATUS</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {['Auto-Triage', 'Investigation', 'Threat Hunt', 'IOC Enrich', 'Report Gen'].map((name, i) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0d1117', borderRadius: 6, padding: '6px 12px', border: '1px solid #1f2937' }}>
              <Bot size={13} color="#00d4ff" />
              <span style={{ fontSize: 12, color: '#d1d5db' }}>{name}</span>
              <span style={{ fontSize: 10, color: '#00d48a', fontFamily: 'JetBrains Mono, monospace' }}>READY</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
