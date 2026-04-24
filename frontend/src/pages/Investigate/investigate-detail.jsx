import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  AlertTriangle,
  Check,
  CircleDot,
  ClipboardList,
  Copy,
  Database,
  Monitor,
  RefreshCw,
  SquareChevronLeft,
  Search,
  TerminalSquare,
} from 'lucide-react'

import { alertsApi } from '../../api'
import InvestigateHeader from './investigate-header'
import { useNavigate } from 'react-router-dom'
  

const panelStyle = {
  background: 'linear-gradient(180deg, rgba(12, 15, 31, 1), rgba(8, 10, 22, 0.6))',
  border: '1px solid rgba(105, 115, 150, 0.42)',
  borderRadius: 14,
  boxShadow: '0 18px 50px rgba(0, 0, 0, 0.09)',
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
const normalizeStatus = (value) => String(value || '').trim().toUpperCase()
const normalizeSeverity = (value) => {
  const lower = String(value || '').toLowerCase()
  if (['critical', 'high', 'medium', 'low'].includes(lower)) return lower
  return 'unknown'
}

const statusBadge = (status) => {
  const normalized = String(status || '').toLowerCase()
  if (normalized.includes('malicious') || normalized.includes('critical')) {
    return { label: 'Malicious', color: '#ff3b55', border: 'rgba(255, 59, 85, 0.7)', background: 'rgba(255, 59, 85, 0.1)' }
  }
  if (normalized.includes('closed') || normalized.includes('complete')) {
    return { label: 'Completed', color: '#7dd3fc', border: 'rgba(125, 211, 252, 0.45)', background: 'rgba(125, 211, 252, 0.08)' }
  }
  return { label: 'In Process', color: '#f4d247', border: 'rgba(244, 210, 71, 0.7)', background: 'rgba(244, 210, 71, 0.1)' }
}

const Field = ({ label, value, mono = false }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '112px minmax(0, 1fr) 18px', gap: 10, alignItems: 'center', minHeight: 26 }}>
    <span style={{ color: '#c8cfdd', fontSize: 12 }}>{label}</span>
    <span
      title={value}
      style={{
        minWidth: 0,
        color: '#f4f6fb',
        fontSize: 12,
        fontFamily: mono ? 'JetBrains Mono, monospace' : 'inherit',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {value || '-'}
    </span>
    <Copy size={12} color="#dce3f4" />
  </div>
)

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

function SeverityBadge({ severity }) {
  const colors = {
    critical: '#ff3b3b',
    high: '#ff8c00',
    medium: '#ffd700',
    low: '#00d48a',
    unknown: '#6b7280',
  }

  const normalized = normalizeSeverity(severity)
  const color = colors[normalized]

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: 999,
        border: `1px solid ${color}`,
        background: `${color}1f`,
        color,
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'capitalize',
      }}
    >
      {normalized}
    </span>
  )
}

const ProgressStep = ({ icon: Icon, title, subtitle, active }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, minWidth: 112 }}>
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        border: `1px solid ${active ? '#ffffff' : 'rgb(255, 255, 255)'}`,
        background: active ? 'hsla(0, 0%, 100%, 0.94)' : 'rgba(8, 10, 22, 0.09)',
        color: active ? '#000000' : '#b5bfd4',
      }}
    >
      <Icon size={15} />
    </div>
    <div style={{ textAlign: 'center' }}>
      <div style={{ color: '#eff3ff', fontSize: 12, fontWeight: 700 }}>{title}</div>
      <div style={{ marginTop: 4, color: '#8d96ab', fontSize: 10 }}>{subtitle}</div>
    </div>
  </div>
)

export default function InvestigateDetail() {
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
      setError(typeof detail === 'string' ? detail : err?.message || 'Unable to load investigation data')
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
  const predictions = useMemo(() => bundle?.predictions || [], [bundle])
  const investigations = useMemo(() => bundle?.investigations || [], [bundle])
  const recommendations = useMemo(() => bundle?.recommendations || [], [bundle])
  const latestPrediction = predictions[0] || {}
  const latestInvestigation = investigations[0] || {}
  const latestRecommendation = recommendations[0] || {}
  const refreshTarget = String(alertId || target || '').trim()
  const badge = statusBadge(latestInvestigation.verdict || alert?.status)

  const title = alert?.alert_name || latestInvestigation.summary || ''
  const source = alert?.source || latestInvestigation.source || '-'
  const severity = alert?.severity || latestInvestigation.severity || '-'
  const contexts = alert?.raw_log?.contexts || {}
  const mitre = Array.isArray(alert?.raw_log?.mitre) ? alert.raw_log.mitre : []

  const typeStatus = normalizeStatus(alert?.status)
  const contextStatus = normalizeStatus(
    bundle?.result_type_prediction?.status
    || latestPrediction?.status
  )
  const investigationStatus = normalizeStatus(
    bundle?.result_investigation?.status
    || latestInvestigation?.status
  )
  const recommendationStatus = normalizeStatus(
    bundle?.recommendation?.status
    || latestRecommendation?.status
  )
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

  const passType = typeStatus === 'RECEIVED'
  const passContext = contextStatus === 'RECEIVED'
  const passInvestigation = investigationStatus === 'RECEIVED'
  const passRecommendation = recommendationStatus === 'RECEIVED'
  const passCompleted = recommendationStatus === 'RECEIVED'

  // Gate each next step by the previous step so progress is strictly sequential.
  const isTypeActive = passType
  const isContextActive = isTypeActive && passContext
  const isInvestigationActive = isContextActive && passInvestigation
  const isRecommendationActive = isInvestigationActive && passRecommendation
  const isCompletedActive = isRecommendationActive && passCompleted
  const activeSteps = [
    isTypeActive,
    isContextActive,
    isInvestigationActive,
    isRecommendationActive,
    isCompletedActive,
  ].filter(Boolean).length
  const lastActiveIndex = Math.max(0, activeSteps - 1)
  const progressPercent = activeSteps <= 1 ? 0 : (lastActiveIndex / 4) * 100

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
          marginBottom: 16,
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
          {/* <Chip tone="red">{badge.label === 'Malicious' ? 'o Malicious' : badge.label}</Chip> */}
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
          <div style={{ marginBottom: 12, color: '#b6c0d6', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>LOAD ALERT DETAILS</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              placeholder="Enter numeric alert id..."
              style={{
                flex: 1,
                minWidth: 0,
                background: '#080b1613',
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
                background: loading ? '#1f2937' : 'rgba(79, 111, 255, 0.09)',
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
        <div style={{ border: '1px solid rgba(255, 64, 88, 0.6)', background: 'rgba(255, 64, 88, 0.09)', color: '#ffb3bd', borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 13 }}>
          {error}
        </div>
      )}

      <section style={{ margin: '0 26px 36px' }}>
        <div style={{ color: '#f4fbfb', fontSize: 13, fontWeight: 700, margin: '10px 0 14px' }}>Progress</div>
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, alignItems: 'start' }}>
          <div
            style={{
              position: 'absolute',
              top: 44,
              left: '10%',
              right: '10%',
              height: 4,
              borderRadius: 999,
              background: 'rgba(228, 228, 228, 0.2)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 44,
              left: '10%',
              width: `${progressPercent * 0.8}%`,
              height: 4,
              borderRadius: 999,
              background: '#1aeaf9',
            }}
          />
          <ProgressStep active={isTypeActive} icon={CircleDot} title="Type" subtitle="Categorize mitre"/>
          <ProgressStep active={isContextActive} icon={ClipboardList} title="Context" subtitle="Extract feature" />
          <ProgressStep active={isInvestigationActive} icon={Search} title="Investigation" subtitle="LLM Processing" />
          <ProgressStep active={isRecommendationActive} icon={Monitor} title="Recommendation" subtitle="Advisement" />
          <ProgressStep active={isCompletedActive} icon={Check} title="Completed" subtitle="" />
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1.08fr) minmax(260px, 0.92fr)', gap: 14, alignItems: 'start' }}>
        <div style={{ ...panelStyle, padding: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#f3f6ff', fontSize: 13, fontWeight: 700, marginBottom: 18 }}>
            <Monitor size={16} /> {title}
          </div>
          <div style={{ display: 'grid', gap: 9 }}>
            <Field label="ID" value={alert?.id || target || '-'} mono />
            <Field label="Source IP" value={contexts.src_ip || '-'} mono />
            <Field label="Domain name" value={alert?.domain_name || alert?.external_alert_id || '-'} />
            <Field label="Trace ID" value={alert?.trace_id || '-'} mono />
            <div style={{ height: 14 }} />
            <Field label="EndPoint Type" value={contexts.endpoint_type || '-'} />
            <Field label="OS" value={contexts.os || '-'} />
            <div style={{ height: 14 }} />
            <Field label="Detect Time" value={formatDate(alert?.detected_time)} mono />
            <Field label="Created at" value={formatDate(alert?.created_at)} mono />
            <Field label="Updated at" value={formatDate(alert?.updated_at)} mono />
          </div>
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ ...panelStyle, minHeight: 46, padding: '13px 22px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertTriangle size={16} color="#f4f6fb" />
            <span style={{ color: '#c9d0df', fontSize: 12 }}>Severity :</span>
            <SeverityBadge severity={severity} />
          </div>
          <div style={{ ...panelStyle, minHeight: 46, padding: '13px 22px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Database size={16} color="#f4f6fb" />
            <span style={{ color: '#c9d0df', fontSize: 12 }}>Log source :</span>
            <strong style={{ color: '#ffffff', fontSize: 13 }}>{source}</strong>
          </div>
          <div style={{ ...panelStyle, padding: 26, minHeight: 176 }}>
            <div style={{ color: '#ffffff', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 800, marginBottom: 22 }}>MITRE ATT&CK</div>
            <div style={{ display: 'grid', gap: 9 }}>
              <div><span style={{ color: '#c2c9d8' }}>Tactic: </span>{mitre[0]?.id || 'none'}<span>, </span>{mitre[1]?.id}</div>
              <div><span style={{ color: '#c2c9d8' }}>Tactic name: </span>{mitre[0]?.name_tactics || 'none'}<span>, </span>{mitre[1]?.name_tactics}</div>
              <div><span style={{ color: '#c2c9d8' }}>Technique: </span>{mitre[0]?.name_technique || 'none'}<span>, </span>{mitre[1]?.name_technique}</div>
              <div><span style={{ color: '#c2c9d8' }}>Subtechnique: </span>{mitre[0]?.name_subtechnique || 'none'}<span>, </span>{mitre[1]?.name_subtechnique}</div>
            </div>
          </div>
        </div>
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
