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
        background: active ? 'hsla(0, 0%, 100%, 0.51)' : 'rgba(8, 10, 22, 0.09)',
        color: active ? '#ffffff' : '#b5bfd4',
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
  // const latestPrediction = predictions[0] || {}
  const latestInvestigation = investigations[0] || {}
  const badge = statusBadge(latestInvestigation.verdict || alert?.status)

  const title = alert?.alert_name || latestInvestigation.summary || ''
  const source = alert?.source || latestInvestigation.source || '-'
  const severity = alert?.severity || latestInvestigation.severity || '-'

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 40px)',
        padding: '20px 20px',
        color: '#f7f8fb',
        // background:
          // 'radial-gradient(circle at 80% 68%, rgba(29, 129, 177, 0.2), transparent 28%), radial-gradient(circle at 20% 82%, rgba(42, 58, 129, 0.2), transparent 74%), #05081441',
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
          <Chip tone="red">{badge.label === 'Malicious' ? 'o Malicious' : badge.label}</Chip>
          <Chip tone="yellow">{statusText(alert?.status)}</Chip>
          <Chip tone="blue">LLM</Chip>
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
        <div style={{ color: '#f4f6fb', fontSize: 13, fontWeight: 700, margin: '10px 0 14px' }}>Progress</div>
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, alignItems: 'start' }}>
          <div style={{ position: 'absolute', top: 44, left: '9%', right: '29%', height: 4, borderRadius: 999, 
            background: 'linear-gradient(90deg, #f9251a 0 48%, rgba(112, 121, 147, 0.09) 48% 100%)' }} />
          <ProgressStep active icon={CircleDot} title="Type" subtitle="Categorize mitre"/>
          <ProgressStep active icon={ClipboardList} title="Context" subtitle="Extract feature" />
          <ProgressStep icon={Search} title="Investigation" subtitle="LLM Processing" />
          <ProgressStep icon={Monitor} title="Recommendation" subtitle="Advisement" />
          <ProgressStep icon={Check} title="Completed" subtitle="" />
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1.08fr) minmax(260px, 0.92fr)', gap: 14, alignItems: 'start' }}>
        <div style={{ ...panelStyle, padding: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#f3f6ff', fontSize: 13, fontWeight: 700, marginBottom: 18 }}>
            <Monitor size={16} /> {title}
          </div>
          <div style={{ display: 'grid', gap: 9 }}>
            <Field label="ID" value={alert?.id || target || '-'} mono />
            <Field label="Source IP" value={alert?.raw_log.contexts.src_ip ||'-'} mono />
            <Field label="Domain name" value={alert?.domain_name || alert?.external_alert_id || '-'} />
            <Field label="Trace ID" value={alert?.trace_id || '-'} mono />
            <div style={{ height: 14 }} />
            <Field label="EndPoint Type" value={alert?.raw_log.contexts.endpoint_type || '-'} />
            <Field label="OS" value={alert?.raw_log.contexts.os || '-'} />
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
            <strong style={{ color: '#ffffff', fontSize: 13 }}>{severity}</strong>
          </div>
          <div style={{ ...panelStyle, minHeight: 46, padding: '13px 22px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Database size={16} color="#f4f6fb" />
            <span style={{ color: '#c9d0df', fontSize: 12 }}>Log source :</span>
            <strong style={{ color: '#ffffff', fontSize: 13 }}>{source}</strong>
          </div>
          <div style={{ ...panelStyle, padding: 26, minHeight: 176 }}>
            <div style={{ color: '#ffffff', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 800, marginBottom: 22 }}>MITRE ATT&CK</div>
            <div style={{ display: 'grid', gap: 9 }}>
              <div><span style={{ color: '#c2c9d8' }}>Tactic: </span>{alert?.raw_log.mitre?.[0]?.id}<span>, </span>{alert?.raw_log.mitre?.[1]?.id || 'none'}</div>
              <div><span style={{ color: '#c2c9d8' }}>Tactic name: </span>{alert?.raw_log.mitre?.[0]?.name_tactics}<span>, </span>{alert?.raw_log.mitre?.[1]?.name_tactics || '-'}</div>
              <div><span style={{ color: '#c2c9d8' }}>Technique: </span>{alert?.raw_log.mitre?.[0]?.name_technique}<span>, </span>{alert?.raw_log.mitre?.[1]?.name_technique || 'none'}</div>
              <div><span style={{ color: '#c2c9d8' }}>Subtechnique: </span>{alert?.raw_log.mitre?.[0]?.name_subtechnique}<span>, </span>{alert?.raw_log.mitre?.[1]?.name_subtechnique || 'none'}</div>
            </div>
          </div>
        </div>
      </section>
   

      {loading && (
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, color: '#b8c2d9', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
          <AlertTriangle size={14} /> Loading data from server...
        </div>
      )}
    </div>
  )
}
