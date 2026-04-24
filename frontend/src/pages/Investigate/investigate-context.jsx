import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  Copy,
  Database,
  Monitor,
  RefreshCw,
  Search,
  SquareChevronLeft,
  TerminalSquare,
} from 'lucide-react'

import { alertsApi } from '../../api'
import InvestigateHeader from './investigate-header'

const panelStyle = {
  background: 'linear-gradient(180deg, rgba(12, 15, 31, 0.96), rgba(8, 10, 22, 0.96))',
  border: '1px solid rgba(105, 115, 150, 0.42)',
  borderRadius: 14,
  boxShadow: '0 18px 50px rgba(0, 0, 0, 0.28)',
}

const toPretty = (value) => {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value)
}

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  const pad = (part) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

const statusText = (value) => String(value || 'in process').replace(/_/g, ' ')

const statusBadge = (status) => {
  const normalized = String(status || '').toLowerCase()
  if (normalized.includes('malicious') || normalized.includes('critical')) return 'Malicious'
  if (normalized.includes('closed') || normalized.includes('complete')) return 'Completed'
  return 'In Process'
}

const pickFirst = (...values) => values.find((value) => value !== null && value !== undefined && value !== '') || '-'

const Chip = ({ children, tone = 'blue' }) => {
  const tones = {
    red: { color: '#ff4058', border: 'rgba(255, 64, 88, 0.7)', background: 'rgba(255, 64, 88, 0.1)' },
    yellow: { color: '#f4d247', border: 'rgba(244, 210, 71, 0.7)', background: 'rgba(244, 210, 71, 0.1)' },
    blue: { color: '#5f87ff', border: 'rgba(95, 135, 255, 0.65)', background: 'rgba(95, 135, 255, 0.12)' },
  }
  const theme = tones[tone]

  return (
    <span
      style={{
        minWidth: 78,
        height: 20,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `1px solid ${theme.border}`,
        borderRadius: 999,
        background: theme.background,
        color: theme.color,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10,
        fontWeight: 700,
      }}
    >
      {children}
    </span>
  )
}

const EntityRow = ({ label, value, icon: Icon }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '76px minmax(0, 1fr) 16px', gap: 8, alignItems: 'center', minHeight: 28 }}>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#f2f5ff', fontSize: 12 }}>
      {Icon && <Icon size={14} color="#d5dcef" />}
      {label}
    </span>
    <span
      title={value}
      style={{
        minWidth: 0,
        color: '#f4f6fb',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 11,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        textAlign: 'right',
      }}
    >
      {value}
    </span>
    <Copy size={12} color="#dce3f4" />
  </div>
)

const InfoBox = ({ children }) => (
  <div
    style={{
      border: '1px solid rgba(105, 115, 150, 0.38)',
      borderRadius: 4,
      padding: 12,
      color: '#dce2f0',
      fontSize: 12,
      lineHeight: 1.55,
      background: 'rgba(6, 9, 20, 0.28)',
    }}
  >
    {children}
  </div>
)

export default function InvestigateContext() {
  const navigate = useNavigate()
  const { alertId } = useParams()

  const [target, setTarget] = useState(alertId || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [bundle, setBundle] = useState(null)

  const loadAlertBundle = async (id) => {
    const parsed = String(id || '').trim()
    if (!parsed) return

    setLoading(true)
    setError('')
    try {
      const response = await alertsApi.details(parsed)
      setBundle(response?.data || null)
    } catch (err) {
      setBundle(null)
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : err?.message || 'Unable to load investigation context')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!alertId) return
    setTarget(alertId)
    loadAlertBundle(alertId)
  }, [alertId])

  const alert = bundle?.alert || null
  const contexts = useMemo(() => bundle?.contexts || [], [bundle])
  const predictions = useMemo(() => bundle?.predictions || [], [bundle])
  const investigations = useMemo(() => bundle?.investigations || [], [bundle])
  const latestContext = contexts[0] || {}
  const latestPrediction = predictions[0] || {}
  const latestInvestigation = investigations[0] || {}
  const isModelTypePrediction = useMemo(() => {
    const normalize = (value) => String(value || '').trim().toLowerCase()

    const directSources = [
      bundle?.result_type_prediction?.source,
      bundle?.result_type_prediction?.Source,
      bundle?.resultTypePrediction?.source,
      bundle?.resultTypePrediction?.Source,
      latestPrediction?.source,
      latestPrediction?.Source,
    ]
    if (directSources.some((sourceValue) => normalize(sourceValue) === 'model')) return true

    if (Array.isArray(bundle?.result_type_prediction)) {
      return bundle.result_type_prediction.some(
        (item) => normalize(item?.source || item?.Source) === 'model'
      )
    }

    return predictions.some(
      (item) => normalize(item?.source || item?.Source) === 'model'
    )
  }, [bundle, latestPrediction, predictions])
  const refreshTarget = String(alertId || target || '').trim()

  const contextData = latestContext.context_data || {}
  const rawLog = alert?.raw_log || latestContext.raw_log || contextData.raw_log || {}
  const rawContext = contextData.raw_context || contextData.context || contextData || {}
  const rawLogContexts = alert?.raw_log?.contexts || {}
  const title = alert?.alert_name || latestInvestigation.summary || 'Untitled Alert'
  const verdict = statusBadge(latestInvestigation.verdict || alert?.status)
  const source = pickFirst(alert?.source, latestContext.source, latestInvestigation.source)

  const handleRefresh = () => {
    if (!refreshTarget || loading) return
    loadAlertBundle(refreshTarget)
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 40px)',
        padding: '50px 20px',
        color: '#f7f8fb',
        borderRadius: 14,
        background:
          'radial-gradient(circle at 80% 68%, rgba(29, 129, 177, 0.22), transparent 28%), radial-gradient(circle at 20% 82%, rgba(42, 58, 129, 0.2), transparent 34%), #050814',
      }}
    >
      <InvestigateHeader />

      <section
        style={{
          ...panelStyle,
          minHeight: 52,
          display: 'grid',
          gridTemplateColumns: '34px minmax(220px, 1fr) auto',
          alignItems: 'center',
          gap: 16,
          padding: '12px 22px',
          marginBottom: 24,
        }}
      >
        <SquareChevronLeft
          size={18}
          color="#f5f7ff"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/alerts')}
        />
        <div style={{ minWidth: 0, color: '#f4f6fb', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {/* <Chip tone="red">{verdict === 'Malicious' ? 'o Malicious' : verdict}</Chip> */}
          {/* <Chip tone="yellow">{statusText(alert?.status)}</Chip> */}
          {isModelTypePrediction && <Chip tone="blue">LLM</Chip>}
          <button
            onClick={handleRefresh}
            disabled={loading || !refreshTarget}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: loading || !refreshTarget ? '#fffff1a' : '#fffff1a',
              border: '1px solid #374151',
              color: loading || !refreshTarget ? '#667085' : '#9ca3af',
              borderRadius: 6,
              padding: '7px 14px',
              cursor: loading || !refreshTarget ? 'not-allowed' : 'pointer',
              fontSize: 12,
            }}
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </section>

      {!alertId && (
        <section style={{ ...panelStyle, padding: 18, marginBottom: 16 }}>
          <div style={{ marginBottom: 12, color: '#b6c0d6', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>LOAD ALERT CONTEXT</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              placeholder="Enter numeric alert id..."
              style={{
                flex: 1,
                minWidth: 0,
                background: '#080b16',
                border: '1px solid rgba(105, 115, 150, 0.42)',
                borderRadius: 8,
                padding: '11px 14px',
                color: '#e5e7eb',
                fontSize: 13,
                outline: 'none',
              }}
            />
            <button
              onClick={() => loadAlertBundle(target)}
              disabled={loading || !target}
              style={{
                width: 112,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: loading ? '#1f2937' : 'rgba(79, 111, 255, 0.15)',
                border: '1px solid rgba(95, 135, 255, 0.65)',
                color: loading ? '#8993a9' : '#dce5ff',
                borderRadius: 8,
                cursor: loading || !target ? 'not-allowed' : 'pointer',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <Search size={14} /> {loading ? '...' : 'LOAD'}
            </button>
          </div>
        </section>
      )}

      {error && (
        <div style={{ border: '1px solid rgba(255, 64, 88, 0.6)', background: 'rgba(255, 64, 88, 0.1)', color: '#ffb3bd', borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 13 }}>
          {error}
        </div>
      )}

      <section style={{ display: 'grid', gridTemplateColumns: '188px minmax(0, 1fr)', gap: 70, alignItems: 'start' }}>
        <aside style={{ ...panelStyle, minHeight: 506, padding: 14, minWidth: 250}}>
          <h2 style={{ margin: '8px 0 16px', color: '#ffffff', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 800, letterSpacing: 0.3 }}>
            ALERT Details
          </h2>

          <div style={{ display: 'grid', gap: 7 }}>
            <EntityRow icon={Monitor} label="ID" value={pickFirst(alert?.id, target)} />
            <EntityRow label="Domain name" value={pickFirst(alert?.domain_name, alert?.external_alert_id)} />
            <EntityRow label="IP" value={pickFirst(latestContext.src_ip, rawLogContexts.src_ip, alert?.source_ip, alert?.ip)} />
            <EntityRow label="Trace_ID" value={pickFirst(alert?.trace_id, alert?.event_id, alert?.external_alert_id)} />
          </div>

          <div style={{ height: 46 }} />

          <h2 style={{ margin: '0 0 8px', color: '#ffffff', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 800, letterSpacing: 0.3 }}>
            MITRE ATT&CK
          </h2>
          <InfoBox>
            <div>Tactic: {pickFirst(latestPrediction.main_tactic)}</div>
            <div>Technique: {pickFirst(latestPrediction.main_technique)}</div>
            <div>{pickFirst(latestPrediction.technique_id, latestPrediction.mitre_id, latestPrediction.sub_technique)}</div>
          </InfoBox>

          <div style={{ height: 28 }} />

          <InfoBox>
            <div>Log source : {source}</div>
          </InfoBox>

          <div style={{ display: 'grid', gap: 7, marginTop: 16, color: '#dce2f0', fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span>Detected</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{formatDate(alert?.detected_time || latestContext.created_at)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span>Create at</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{formatDate(alert?.created_at || latestContext.created_at)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span>Update at</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{formatDate(alert?.updated_at || latestContext.updated_at)}</span>
            </div>
            {/* <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span>Latency</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{pickFirst(latestContext.latency, latestContext.latency_seconds)}</span>
            </div> */}
          </div>
        </aside>

        <main>
          <div
            style={{
              ...panelStyle,
              width: 170,
              minHeight: 38,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '8px 18px',
              marginBottom: 10,
              borderRadius: 12,
            }}
          >
            <TerminalSquare size={16} color="#dce5ff" />
            <span style={{ color: '#f7f8fb', fontSize: 16, fontWeight: 800 }}>Context Log</span>
          </div>

          <section
            style={{
              ...panelStyle,
              minHeight: 480,
              maxHeight: 'calc(100vh - 255px)',
              overflow: 'auto',
              padding: '42px 34px',
            }}
          >
            <div style={{ marginBottom: 34 }}>
              {/* <h3 style={{ margin: '0 0 18px', color: '#ffffff', fontFamily: 'JetBrains Mono, monospace', fontSize: 15, letterSpacing: 2 }}>
                Type
              </h3> */}
              <pre style={{ margin: 0, color: '#d8deed', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                {toPretty(rawLog)}
              </pre>
            </div>

            {/* <div>
              <pre style={{ margin: 0, color: '#d8deed', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                {toPretty(rawContext)}
              </pre>
            </div> */}
          </section>
        </main>
      </section>

      {loading && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(4, 7, 18, 0.64)',
            backdropFilter: 'blur(2px)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: 'min(360px, calc(100vw - 32px))',
              borderRadius: 12,
              border: '1px solid rgba(255, 64, 88, 0.55)',
              background: 'linear-gradient(180deg, rgba(19, 23, 45, 0.98), rgba(10, 14, 30, 0.98))',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.42)',
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: '#f6d1d7',
              fontSize: 12,
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 700,
            }}
          >
            <AlertTriangle size={16} color="#ff6b7d" />
            <span>Loading data from server...</span>
          </div>
        </div>
      )}
    </div>
  )
}
