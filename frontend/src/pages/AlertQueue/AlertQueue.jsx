import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, Filter, Search, ChevronRight } from 'lucide-react'
import { alertsApi } from '../../api'

const SEV_ORDER = { critical: 0, high: 1, medium: 2, low: 3 }

function SeverityBadge({ severity }) {
  return (
    <span className={`badge-${severity}`} style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, textTransform: 'uppercase' }}>
      {severity}
    </span>
  )
}

function StatusBadge({ status }) {
  const color = { open: '#ffd700', triaged: '#00d4ff', escalated: '#ff8c00', closed: '#6b7280' }[status] || '#6b7280'
  return (
    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color, background: `${color}18`, border: `1px solid ${color}40`, textTransform: 'uppercase' }}>
      {status}
    </span>
  )
}

export default function AlertQueue() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    alertsApi.list()
      .then(r => setAlerts(r.data))
      .catch(() => setAlerts([
        { id: '1', title: 'Brute Force Login Detected', severity: 'high', status: 'open', source: 'SIEM', src_ip: '192.168.1.105', mitre_tactic: 'TA0006', created_at: new Date().toISOString() },
        { id: '2', title: 'Lateral Movement via SMB', severity: 'critical', status: 'open', source: 'EDR', src_ip: '10.0.1.22', mitre_tactic: 'TA0008', created_at: new Date().toISOString() },
        { id: '3', title: 'Suspicious PowerShell Execution', severity: 'high', status: 'triaged', source: 'EDR', src_ip: '10.0.2.15', mitre_tactic: 'TA0002', created_at: new Date().toISOString() },
        { id: '4', title: 'DNS Tunneling Detected', severity: 'medium', status: 'open', source: 'NDR', src_ip: '172.16.0.10', mitre_tactic: 'TA0011', created_at: new Date().toISOString() },
        { id: '5', title: 'Ransomware File Encryption Activity', severity: 'critical', status: 'escalated', source: 'EDR', src_ip: '10.0.3.88', mitre_tactic: 'TA0040', created_at: new Date().toISOString() },
      ]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = alerts
    .filter(a => filter === 'all' || a.severity === filter || a.status === filter)
    .filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.src_ip?.includes(search))
    .sort((a, b) => (SEV_ORDER[a.severity] ?? 9) - (SEV_ORDER[b.severity] ?? 9))

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 11, color: '#6b7280', fontFamily: 'JetBrains Mono, monospace', letterSpacing: 2, textTransform: 'uppercase' }}>SOC</div>
          <h1 style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 600, color: '#f9fafb' }}>Alert Queue</h1>
        </div>
        <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1f2937', border: '1px solid #374151', color: '#9ca3af', borderRadius: 6, padding: '7px 14px', cursor: 'pointer', fontSize: 12 }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8, background: '#181818', border: '1px solid #1f2937', borderRadius: 6, padding: '0 12px' }}>
          <Search size={13} color="#6b7280" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search alerts, IPs..." style={{ background: 'none', border: 'none', outline: 'none', color: '#e5e7eb', fontSize: 13, padding: '9px 0', width: '100%' }} />
        </div>
        {['all', 'critical', 'high', 'medium', 'open', 'escalated'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '7px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: 0.5, background: filter === f ? '#00d4ff18' : '#181818', color: filter === f ? '#00d4ff' : '#6b7280', border: filter === f ? '1px solid #00d4ff40' : '1px solid #1f2937' }}>
            {f}
          </button>
        ))}
      </div>

      {/* Alert table */}
      <div style={{ background: '#181818', border: '1px solid #1f2937', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1f2937' }}>
              {['Severity', 'Alert', 'Source', 'Src IP', 'MITRE', 'Status', 'Time', ''].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, color: '#6b7280', fontFamily: 'JetBrains Mono, monospace', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#6b7280', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>Loading alerts...</td></tr>
            ) : filtered.map((alert, i) => (
              <tr key={alert.id} style={{ borderBottom: '1px solid #1f2937', background: i % 2 === 0 ? 'transparent' : '#0d111780', cursor: 'pointer', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#00d4ff08'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : '#0d111780'}
                onClick={() => navigate(`/investigate/${alert.id}`)}>
                <td style={{ padding: '12px 16px' }}><SeverityBadge severity={alert.severity} /></td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#e5e7eb', maxWidth: 280 }}>{alert.title}</td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }}>{alert.source}</td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: '#00d4ff', fontFamily: 'JetBrains Mono, monospace' }}>{alert.src_ip || '—'}</td>
                <td style={{ padding: '12px 16px', fontSize: 11, color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }}>{alert.mitre_tactic || '—'}</td>
                <td style={{ padding: '12px 16px' }}><StatusBadge status={alert.status} /></td>
                <td style={{ padding: '12px 16px', fontSize: 11, color: '#6b7280', fontFamily: 'JetBrains Mono, monospace' }}>{new Date(alert.created_at).toLocaleTimeString()}</td>
                <td style={{ padding: '12px 16px' }}><ChevronRight size={14} color="#374151" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#6b7280', fontSize: 13 }}>No alerts match your filter.</div>
        )}
      </div>
    </div>
  )
}
