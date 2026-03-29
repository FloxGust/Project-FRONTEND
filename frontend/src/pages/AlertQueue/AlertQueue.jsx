import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, Search, ChevronRight } from 'lucide-react'
import { agentQueueApi } from '../../api'

const SEV_ORDER = { critical: 0, high: 1, medium: 2, low: 3, unknown: 4 }
const AGENT_QUEUE_SOURCE = `${(import.meta.env.VITE_AGENT_QUEUE_BASE_URL || 'http://192.168.1.9:8000').replace(/\/+$/, '')}/api/agent-queue/`

const normalizeSeverity = (value) => {
  const mapped = String(value || 'unknown').toLowerCase().trim()
  return ['critical', 'high', 'medium', 'low'].includes(mapped) ? mapped : 'unknown'
}

const normalizeStatus = (value) => String(value || 'pending').toLowerCase().trim()

const extractQueueRows = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.results)) return data.results
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.value)) return data.value
  if (Array.isArray(data?.data?.items)) return data.data.items
  if (Array.isArray(data?.data?.results)) return data.data.results
  return []
}

const toDisplayDateTime = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString()
}

const stringifyValue = (value) => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

const summarizePayload = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return '-'
  const entries = Object.entries(payload).filter(([k]) => !['alert_name', 'severity'].includes(k))
  if (entries.length === 0) return '-'
  return entries
    .slice(0, 2)
    .map(([k, v]) => `${k}: ${stringifyValue(v)}`)
    .join(' | ')
}

const normalizeQueueItem = (item) => {
  const payload = item?.payload && typeof item.payload === 'object' && !Array.isArray(item.payload) ? item.payload : {}
  const queueId = item?.id || item?.queue_id || item?.uuid || ''
  const logId = item?.log_id || payload?.log_id || ''
  const subject = item?.subject || payload?.subject || ''
  const alertName = payload?.alert_name || payload?.title || item?.title || subject || '-'
  const severity = normalizeSeverity(payload?.severity || item?.severity)
  const status = normalizeStatus(item?.status)
  const sentAt = item?.sent_at || item?.created_at || item?.updated_at || null

  return {
    ...item,
    payload,
    queue_id: String(queueId || '-'),
    log_id: String(logId || '-'),
    subject: String(subject || '-'),
    alert_name: String(alertName || '-'),
    severity,
    status,
    sent_at: sentAt,
  }
}

function SeverityBadge({ severity }) {
  const color = {
    critical: '#ff3b3b',
    high: '#ff8c00',
    medium: '#ffd700',
    low: '#00d48a',
    unknown: '#6b7280',
  }[severity] || '#6b7280'

  return (
    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color, background: `${color}18`, border: `1px solid ${color}40`, textTransform: 'uppercase' }}>
      {severity}
    </span>
  )
}

function StatusBadge({ status }) {
  const color = {
    pending: '#ffd700',
    processing: '#00d4ff',
    completed: '#00d48a',
    success: '#00d48a',
    sent: '#00d48a',
    failed: '#ff3b3b',
    error: '#ff3b3b',
    cancelled: '#6b7280',
  }[status] || '#9ca3af'

  return (
    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color, background: `${color}18`, border: `1px solid ${color}40`, textTransform: 'uppercase' }}>
      {status}
    </span>
  )
}

export default function AlertQueue() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await agentQueueApi.list()
      const rows = extractQueueRows(response.data).map(normalizeQueueItem)
      setAlerts(rows)
    } catch (err) {
      setAlerts([])
      const isNetworkError = !err?.response && (String(err?.message || '').toLowerCase().includes('network') || String(err?.code || '').toUpperCase() === 'ERR_NETWORK')
      setError(
        isNetworkError
          ? 'Browser blocked request (likely CORS). Check backend Access-Control-Allow-Origin.'
          : (err?.response?.data?.detail || err?.message || 'Unable to load agent queue.')
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filterOptions = useMemo(() => {
    const options = new Set(['all'])
    for (const item of alerts) {
      if (item.status) options.add(item.status)
      if (item.severity && item.severity !== 'unknown') options.add(item.severity)
    }
    return Array.from(options)
  }, [alerts])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return alerts
      .filter((a) => filter === 'all' || a.status === filter || a.severity === filter)
      .filter((a) => {
        if (!query) return true
        return [a.queue_id, a.log_id, a.subject, a.alert_name, summarizePayload(a.payload)]
          .some((v) => String(v || '').toLowerCase().includes(query))
      })
      .sort((a, b) => {
        const bTime = b.sent_at ? new Date(b.sent_at).getTime() : 0
        const aTime = a.sent_at ? new Date(a.sent_at).getTime() : 0
        if (aTime !== bTime) return bTime - aTime
        return (SEV_ORDER[a.severity] ?? 9) - (SEV_ORDER[b.severity] ?? 9)
      })
  }, [alerts, filter, search])

  const toInvestigateTarget = (alert) => alert.log_id !== '-' ? alert.log_id : (alert.queue_id !== '-' ? alert.queue_id : '')

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 11, color: '#6b7280', fontFamily: 'JetBrains Mono, monospace', letterSpacing: 2, textTransform: 'uppercase' }}>SOC</div>
          <h1 style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 600, color: '#f9fafb' }}>Alert Queue</h1>
          <div style={{ marginTop: 4, fontSize: 11, color: '#6b7280', fontFamily: 'JetBrains Mono, monospace' }}>
            SOURCE: {AGENT_QUEUE_SOURCE}
          </div>
        </div>
        <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1f2937', border: '1px solid #374151', color: '#9ca3af', borderRadius: 6, padding: '7px 14px', cursor: 'pointer', fontSize: 12 }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 260, display: 'flex', alignItems: 'center', gap: 8, background: '#181818', border: '1px solid #1f2937', borderRadius: 6, padding: '0 12px' }}>
          <Search size={13} color="#6b7280" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search queue id, log id, subject..." style={{ background: 'none', border: 'none', outline: 'none', color: '#e5e7eb', fontSize: 13, padding: '9px 0', width: '100%' }} />
        </div>
        {filterOptions.map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '7px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: 0.5, background: filter === f ? '#00d4ff18' : '#181818', color: filter === f ? '#00d4ff' : '#6b7280', border: filter === f ? '1px solid #00d4ff40' : '1px solid #1f2937' }}>
            {f}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 8, fontSize: 11, color: '#6b7280', fontFamily: 'JetBrains Mono, monospace' }}>
        ROWS: {filtered.length}
      </div>

      <div style={{ background: '#181818', border: '1px solid #1f2937', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1f2937' }}>
              {['Status', 'Severity', 'Queue ID', 'Log ID', 'Subject', 'Alert', 'Sent At', 'Payload', ''].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, color: '#6b7280', fontFamily: 'JetBrains Mono, monospace', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#6b7280', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>Loading queue...</td></tr>
            ) : error ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#ff6b6b', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{error}</td></tr>
            ) : filtered.map((alert, i) => {
              const investigateTarget = toInvestigateTarget(alert)
              const canInvestigate = Boolean(investigateTarget)

              return (
                <tr
                  key={`${alert.queue_id}-${i}`}
                  style={{ borderBottom: '1px solid #1f2937', background: i % 2 === 0 ? 'transparent' : '#0d111780', cursor: canInvestigate ? 'pointer' : 'default', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#00d4ff08'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : '#0d111780'}
                  onClick={() => canInvestigate && navigate(`/investigate/${investigateTarget}`)}
                >
                  <td style={{ padding: '12px 16px' }}><StatusBadge status={alert.status} /></td>
                  <td style={{ padding: '12px 16px' }}><SeverityBadge severity={alert.severity} /></td>
                  <td style={{ padding: '12px 16px', fontSize: 11, color: '#e5e7eb', fontFamily: 'JetBrains Mono, monospace' }}>{alert.queue_id}</td>
                  <td style={{ padding: '12px 16px', fontSize: 11, color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }}>{alert.log_id}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#d1d5db', maxWidth: 180 }}>{alert.subject}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#e5e7eb', maxWidth: 220 }}>{alert.alert_name}</td>
                  <td style={{ padding: '12px 16px', fontSize: 11, color: '#6b7280', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>{toDisplayDateTime(alert.sent_at)}</td>
                  <td style={{ padding: '12px 16px', fontSize: 11, color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace', maxWidth: 260 }}>{summarizePayload(alert.payload)}</td>
                  <td style={{ padding: '12px 16px' }}><ChevronRight size={14} color="#374151" /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#6b7280', fontSize: 13 }}>No queue data matches your filter.</div>
        )}
      </div>
    </div>
  )
}
