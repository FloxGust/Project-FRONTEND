import { useEffect, useMemo, useState } from 'react'
import { Activity, AlertTriangle, ShieldAlert, TrendingUp } from 'lucide-react'
import { Bar, BarChart, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { alertsApi } from '../../api'

const EMPTY_STATS = {
  total: 0,
  critical: 0,
  high: 0,
  medium: 0,
  low: 0,
  open: 0,
  escalated: 0,
}

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div style={{ background: '#181818', border: '1px solid #383838', borderRadius: 8, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
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

const normalizeStatus = (value) => String(value || '').toLowerCase()
const normalizeSeverity = (value) => String(value || '').toLowerCase()

const computeStatsFromAlerts = (alerts) => {
  return {
    total: alerts.length,
    critical: alerts.filter((a) => normalizeSeverity(a.severity) === 'critical').length,
    high: alerts.filter((a) => normalizeSeverity(a.severity) === 'high').length,
    medium: alerts.filter((a) => normalizeSeverity(a.severity) === 'medium').length,
    low: alerts.filter((a) => normalizeSeverity(a.severity) === 'low').length,
    open: alerts.filter((a) => ['received', 'open', 'pending', 'processing'].includes(normalizeStatus(a.status))).length,
    escalated: alerts.filter((a) => ['escalated', 'processing'].includes(normalizeStatus(a.status))).length,
  }
}

export default function Dashboard() {
  const [alerts, setAlerts] = useState([])
  const [stats, setStats] = useState(EMPTY_STATS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [alertsResponse, statsResponse] = await Promise.all([
          alertsApi.list({ skip: 0, limit: 500 }),
          alertsApi.stats(),
        ])
        const rows = Array.isArray(alertsResponse?.data) ? alertsResponse.data : []
        setAlerts(rows)
        setStats({ ...EMPTY_STATS, ...(statsResponse?.data || {}) })
      } catch {
        try {
          const fallback = await alertsApi.list({ skip: 0, limit: 500 })
          const rows = Array.isArray(fallback?.data) ? fallback.data : []
          setAlerts(rows)
          setStats(computeStatsFromAlerts(rows))
        } catch {
          setAlerts([])
          setStats(EMPTY_STATS)
        }
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const severityData = useMemo(
    () => [
      { name: 'Critical', value: stats.critical || 0, fill: '#ff3b3b' },
      { name: 'High', value: stats.high || 0, fill: '#ff8c00' },
      { name: 'Medium', value: stats.medium || 0, fill: '#ffd700' },
      { name: 'Low', value: stats.low || 0, fill: '#00d48a' },
    ],
    [stats]
  )

  const trendData = useMemo(() => {
    const buckets = new Map()
    for (let dayOffset = 6; dayOffset >= 0; dayOffset -= 1) {
      const date = new Date()
      date.setDate(date.getDate() - dayOffset)
      const key = date.toISOString().slice(0, 10)
      buckets.set(key, { time: key.slice(5), alerts: 0 })
    }

    for (const alert of alerts) {
      const detected = alert?.detected_time ? new Date(alert.detected_time) : null
      if (!detected || Number.isNaN(detected.getTime())) continue
      const key = detected.toISOString().slice(0, 10)
      if (!buckets.has(key)) continue
      const entry = buckets.get(key)
      entry.alerts += 1
      buckets.set(key, entry)
    }

    return Array.from(buckets.values())
  }, [alerts])

  const sourceData = useMemo(() => {
    const counts = alerts.reduce((acc, alert) => {
      const source = String(alert?.source || 'Unknown')
      acc[source] = (acc[source] || 0) + 1
      return acc
    }, {})

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value, fill: '#00d4ff' }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [alerts])

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: '#6b7280', fontFamily: 'JetBrains Mono, monospace', letterSpacing: 2, textTransform: 'uppercase' }}>Security Operations Center</div>
        <h1 style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 600, color: '#f9fafb' }}>Dashboard</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard icon={ShieldAlert} label="Total Alerts" value={loading ? '-' : stats.total} color="#00d4ff" sub="From server dataset" />
        <StatCard icon={AlertTriangle} label="Critical" value={loading ? '-' : stats.critical} color="#ff3b3b" sub="Highest severity" />
        <StatCard icon={Activity} label="Open" value={loading ? '-' : stats.open} color="#ffd700" sub="Pending or processing" />
        <StatCard icon={TrendingUp} label="Escalated" value={loading ? '-' : stats.escalated} color="#ff8c00" sub="Escalation in progress" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#181818', border: '1px solid #1f2937', borderRadius: 8, padding: 20 }}>
          <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace', marginBottom: 16 }}>ALERT VOLUME - LAST 7 DAYS</div>
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={trendData}>
              <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 6, fontSize: 12 }} />
              <Line type="monotone" dataKey="alerts" stroke="#00d4ff" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#181818', border: '1px solid #1f2937', borderRadius: 8, padding: 20 }}>
          <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace', marginBottom: 16 }}>BY SEVERITY</div>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={severityData} layout="vertical">
              <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={55} />
              <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 6, fontSize: 12 }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {severityData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ background: '#181818', border: '1px solid #1f2937', borderRadius: 8, padding: 20 }}>
        <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace', marginBottom: 16 }}>TOP SOURCES</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={sourceData}>
            <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 6, fontSize: 12 }} />
            <Bar dataKey="value" fill="#00d4ff" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
