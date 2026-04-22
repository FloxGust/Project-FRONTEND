import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, RefreshCw, Search } from 'lucide-react'

import { alertsApi } from '../../api'
import { RGBAFormat } from 'three/src/constants.js'

const normalizeSeverity = (value) => {
  const lower = String(value || '').toLowerCase()
  if (['critical', 'high', 'medium', 'low'].includes(lower)) return lower
  return 'unknown'
}

const normalizeStatus = (value) => {
  const lower = String(value || '').toLowerCase()
  if (!lower) return 'unknown'
  return lower
}

const toDisplayDateTime = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString()
}

const extractSrcIp = (alert) => {
  const fromRaw = alert?.raw_log?.contexts?.src_ip
  if (Array.isArray(fromRaw)) return fromRaw.join(', ')
  if (typeof fromRaw === 'string') return fromRaw
  return '-'
}

const normalizeAlert = (alert) => {
  const severity = normalizeSeverity(alert?.severity)
  const status = normalizeStatus(alert?.status)
  return {
    id: String(alert?.id ?? '-'),
    external_alert_id: String(alert?.external_alert_id ?? '-'),
    alert_name: String(alert?.alert_name ?? '-'),
    source: String(alert?.source ?? '-'),
    severity,
    status,
    detected_time: alert?.detected_time || null,
    trace_id: String(alert?.trace_id ?? '-'),
    src_ip: extractSrcIp(alert),
  }
}

function SeverityBadge({ severity }) {
  const colors = {
    critical: '#ff3b3b',
    high: '#ff8c00',
    medium: '#ffd700',
    low: '#00d48a',
    unknown: '#6b7280',
  }
  const color = colors[severity] || colors.unknown
  return (
    <span
      style={{
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 10,
        fontFamily: 'JetBrains Mono, monospace',
        color,
        background: `${color}18`,
        border: `1px solid ${color}40`,
        textTransform: 'uppercase',
      }}
    >
      {severity}
    </span>
  )
}

function StatusBadge({ status }) {
  const colors = {
    received: '#00d4ff',
    pending: '#ffd700',
    processing: '#ff8c00',
    done: '#00d48a',
    open: '#00d4ff',
    closed: '#6b7280',
    unknown: '#9ca3af',
  }
  const color = colors[status] || colors.unknown
  return (
    <span
      style={{
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 10,
        fontFamily: 'JetBrains Mono, monospace',
        color,
        background: `${color}18`,
        border: `1px solid ${color}40`,
        textTransform: 'uppercase',
      }}
    >
      {status}
    </span>
  )
}

export default function AlertQueue() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const navigate = useNavigate()

  const loadAlerts = async () => {
    setLoading(true)
    setError('')
    try {
      const pageSize = 200
      const maxRows = 5000
      let skip = 0
      const allRows = []

      while (skip < maxRows) {
        const response = await alertsApi.list({ skip, limit: pageSize })
        const batch = Array.isArray(response?.data) ? response.data : []
        allRows.push(...batch)
        if (batch.length < pageSize) break
        skip += pageSize
      }

      const rows = allRows.map(normalizeAlert)
      setAlerts(rows)
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : err?.message || 'Unable to load alerts')
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlerts()
  }, [])

  const filterOptions = useMemo(() => {
    const options = new Set(['all'])
    for (const alert of alerts) {
      // if (alert.status) options.add(alert.status)
      if (alert.severity && alert.severity !== 'unknown') options.add(alert.severity)
      if (alert.source && alert.source !== '-') options.add(alert.source)
    }
    return Array.from(options)
  }, [alerts])

  const filteredAlerts = useMemo(() => {
    const query = search.trim().toLowerCase()
    return alerts
      .filter((alert) => {
        if (filter === 'all') return true
        return  alert.severity === filter || alert.source === filter //alert.status === filter ||
      })
      .filter((alert) => {
        if (!query) return true
        return [
          alert.id,
          alert.external_alert_id,
          alert.alert_name,
          alert.source,
          alert.trace_id,
          alert.src_ip,
        ].some((value) => String(value || '').toLowerCase().includes(query))
      })
      .sort((a, b) => {
        const aTime = a.detected_time ? new Date(a.detected_time).getTime() : 0
        const bTime = b.detected_time ? new Date(b.detected_time).getTime() : 0
        return bTime - aTime
      })
  }, [alerts, filter, search])
  // main
  return (
    <div style={{ padding: 24}}>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 11, color: '#6b7280', fontFamily: 'JetBrains Mono, monospace', letterSpacing: 2, textTransform: 'uppercase' }}>
            PAIAC
          </div>
          <h1 style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 600, color: '#f9fafb' }}>Investigations</h1>
          <div style={{ marginTop: 4, fontSize: 11, color: '#6b7280', fontFamily: 'JetBrains Mono, monospace' }}>
            SOURCE: /api/alerts
          </div>
        </div>
        <button
          onClick={loadAlerts}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: '#111111',
            border: '1px solid #374151',
            color: '#9ca3af',
            borderRadius: 6,
            padding: '7px 14px',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div
          style={{
            flex: 1,
            minWidth: 260,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#181818', // Searchbox
            border: '1px solid #1f2937',
            borderRadius: 6,
            padding: '0 12px',
          }}
        >
          <Search size={13} color="#6b7280" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search id, external id, trace id, source, ip..."
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              color: '#e5e7eb',
              fontSize: 13,
              padding: '9px 0',
              width: '100%',
            }}
          />
        </div>

        {filterOptions.map((option) => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            style={{
              padding: '7px 14px',
              borderRadius: 6,
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              background: filter === option ? '#00d4ff18' : '#181818',
              color: filter === option ? '#00d4ff' : '#6b7280',
              border: filter === option ? '1px solid #00d4ff40' : '1px solid #1f2937',
            }}
          >
            {option}
          </button>
        ))}
      </div>

        {/* Table */}
      <div style={{ marginBottom: 8, fontSize: 11, color: '#6b7280', fontFamily: 'JetBrains Mono, monospace' }}>
        TOTAL: {filteredAlerts.length}
      </div>
      {/* ปรับสีตาราง */}
      <div style={{ background: '#0f0f0f', border: '1px solid #1f2937', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1f2937' }}>
              {['Severity', 'ID', 'External ID', 'Alert Name', 'Source', 'Detected', 'Trace ID', 'Source IP', ''].map((header) => (
                <th
                  key={header}
                  style={{
                    padding: '10px 16px',
                    textAlign: 'left',
                    fontSize: 10,
                    color: '#6b7280',
                    fontFamily: 'JetBrains Mono, monospace',
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    fontWeight: 500,
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: 40, color: '#6b7280', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
                  Loading alerts...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: 40, color: '#ff6b6b', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
                  {error}
                </td>
              </tr>
            ) : (
              filteredAlerts.map((alert, index) => (
                <tr
                  key={`${alert.id}-${index}`}
                  style={{
                    borderBottom: '1px solid #1f2937',
                    background: index % 2 === 0 ? 'transparent' : '#0d111780',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.background = '#00d4ff08'
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background = index % 2 === 0 ? 'transparent' : '#0d111780'
                  }}
                  onClick={() => navigate(`/investigate/${alert.id}`)}
                >
                  {/* <td style={{ padding: '12px 16px' }}>
                    <StatusBadge status={alert.status} />
                  </td> */}
                  <td style={{ padding: '12px 16px' }}>
                    <SeverityBadge severity={alert.severity} />
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 11, color: '#e5e7eb', fontFamily: 'JetBrains Mono, monospace' }}>{alert.id}</td>
                  <td style={{ padding: '12px 16px', fontSize: 11, color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }}>{alert.external_alert_id}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#d1d5db', maxWidth: 260 }}>{alert.alert_name}</td>
                  <td style={{ padding: '12px 16px', fontSize: 11, color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }}>{alert.source}</td>
                  <td style={{ padding: '12px 16px', fontSize: 11, color: '#6b7280', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>
                    {toDisplayDateTime(alert.detected_time)}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 11, color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }}>{alert.trace_id}</td>
                  <td style={{ padding: '12px 16px', fontSize: 11, color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }}>{alert.src_ip}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <ChevronRight size={14} color="#374151" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!loading && !error && filteredAlerts.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#6b7280', fontSize: 13 }}>No alerts match your filter.</div>
        )}
      </div>
    </div>
  )
}
