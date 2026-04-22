import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  Copy,
  Monitor,
  RefreshCw,
  Search,
  Sparkles,
  SquareChevronLeft,
} from 'lucide-react'

import { alertsApi } from '../../api'
import InvestigateHeader from './investigate-header'

const panelStyle = {
  background: 'linear-gradient(180deg, rgba(12, 15, 31, 0.96), rgba(8, 10, 22, 0.96))',
  border: '1px solid rgba(105, 115, 150, 0.42)',
  borderRadius: 14,
  boxShadow: '0 18px 50px rgba(0, 0, 0, 0.28)',
}

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  const pad = (part) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

const pickFirst = (...values) => values.find((value) => value !== null && value !== undefined && value !== '') || '-'

const statusText = (value) => String(value || 'in process').replace(/_/g, ' ')

const statusBadge = (status) => {
  const normalized = String(status || '').toLowerCase()
  if (normalized.includes('malicious') || normalized.includes('critical')) return 'Malicious'
  if (normalized.includes('closed') || normalized.includes('complete')) return 'Completed'
  if (normalized.includes('benign')) return 'Benign'
  if (normalized.includes('suspicious')) return 'Suspicious'
  return 'In Process'
}

const normalizeConfidence = (value) => {
  if (value === null || value === undefined || value === '') return '-'
  const parsed = Number(value)
  if (Number.isNaN(parsed)) return String(value)
  return parsed <= 1 ? `${Math.round(parsed * 100)} %` : `${Math.round(parsed)} %`
}

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

const VerdictOption = ({ label, active }) => (
  <span
    style={{
      color: active ? '#ffffff' : '#8f98ad',
      fontSize: 12,
      fontWeight: active ? 800 : 500,
    }}
  >
    {label}
  </span>
)

const HighlightedConclusion = ({ value }) => {
  const parts = String(value).split(/(True Positive|False Positive)/gi)

  return parts.map((part, index) => {
    const normalized = part.toLowerCase()
    const isTruePositive = normalized === 'true positive'
    const isFalsePositive = normalized === 'false positive'

    if (!isTruePositive && !isFalsePositive) return part

    return (
      <span
        key={`${part}-${index}`}
        style={{
          color: isTruePositive ? '#3fe27f' : '#ff4058',
          fontWeight: 900,
        }}
      >
        {part}
      </span>
    )
  })
}

const BehaviorFactorBlock = ({ factor, index }) => {
  const rows = [
    ['Validation', factor?.validation],
    ['Benign indicators', factor?.benignIndicators || factor?.benign_indicators],
    ['Observed evidence', factor?.observedEvidence || factor?.observed_evidence],
    ['Recommended response', factor?.recommendedResponse || factor?.recommended_response],
    ['Suspicious indicators', factor?.suspiciousIndicators || factor?.suspicious_indicators],
  ].filter(([, value]) => value !== null && value !== undefined && value !== '')

  return (
    <section style={{ ...panelStyle, minHeight: 120, padding: 24 }}>
      <h3 style={{ margin: '0 0 14px', color: '#ffffff', fontSize: 13, fontWeight: 800 }}>
        {factor?.factor || `Behavior Factor ${index + 1}`}
      </h3>
      <div style={{ display: 'grid', gap: 14 }}>
        {rows.map(([label, value]) => (
          <div key={label}>
            <div style={{ marginBottom: 6, color: '#8f98ad', fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>
              {label}
            </div>
            <p style={{ margin: 0, color: '#c3cad9', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {Array.isArray(value) ? value.join('\n') : String(value)}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function InvestigateSummary() {
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
      setError(typeof detail === 'string' ? detail : err?.message || 'Unable to load investigation summary')
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
  const recommendations = useMemo(() => bundle?.recommendations || [], [bundle])
  const latestContext = contexts[0] || {}
  const latestPrediction = predictions[0] || {}
  const latestInvestigation = investigations[0] || {}
  const latestRecommendation = recommendations[0] || {}
  const investigationData = latestInvestigation?.investigation_data || {}
  const logClassification = investigationData.logClassification || {}
  const rawKeyEntities = logClassification.keyEntities || logClassification.key_entities
  const keyEntities = Array.isArray(rawKeyEntities)
    ? rawKeyEntities
    : []
  const rawBehaviorFactors = investigationData.behaviorFactors
    || investigationData.behavior_factors
    || logClassification.behaviorFactors
    || logClassification.behavior_factors
    || latestInvestigation.behaviorFactors
    || latestInvestigation.behavior_factors
  const behaviorFactors = Array.isArray(rawBehaviorFactors)
    ? rawBehaviorFactors
    : []
  const refreshTarget = String(alertId || target || '').trim()

  const title = alert?.alert_name || latestInvestigation.summary || 'Untitled Alert'
  const verdict = statusBadge(latestInvestigation.verdict || alert?.status)
  const confidence = pickFirst(latestInvestigation.confidence, latestPrediction.confidence)
  const confidenceLabel = normalizeConfidence(confidence)
  const source = pickFirst(alert?.source, latestContext.source, latestInvestigation.source)
  const analysisSummary = pickFirst(
    latestInvestigation.summary,
    'Analysis will appear here after the investigation agent completes this alert.'
  )
  const conclusion = pickFirst(
    investigationData.conclusion,
    'Conclusion will appear here after the investigation agent completes this alert.'
  )
  const behaviorAnalysis = pickFirst(
    latestInvestigation.behavior_analysis,
    latestRecommendation.content,
    latestRecommendation.summary,
    'Behavior analysis is waiting for additional investigation output.'
  )
  const mitreRows = predictions.length > 0 ? predictions.slice(0, 3) : [latestPrediction, latestPrediction, latestPrediction]

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
          <Chip tone="red">{verdict === 'Malicious' ? 'o Malicious' : verdict}</Chip>
          <Chip tone="yellow">{statusText(alert?.status)}</Chip>
          <Chip tone="blue">LLM</Chip>
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
          <div style={{ marginBottom: 12, color: '#b6c0d6', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>LOAD ALERT SUMMARY</div>
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

      <section style={{ display: 'grid', gridTemplateColumns: '250px 1fr 250px', gap: 16, alignItems: 'start' }}>
        <aside style={{ ...panelStyle, minHeight: 506, padding: 14, minWidth: 250 }}>

          <h2 style={{ margin: '8px 0 16px', color: '#ffffff', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 800, letterSpacing: 0.3 }}>
            ALERT Details
          </h2>

          <div style={{ display: 'grid', gap: 16 }}>
            <EntityRow icon={Monitor} label="ID" value={pickFirst(alert?.id, target)} />
            <EntityRow label="Domain name" value={pickFirst(alert?.domain_name, alert?.external_alert_id)} />
            <EntityRow label="IP" value={pickFirst(latestContext.src_ip, alert?.raw_log?.contexts?.src_ip, alert?.source_ip, alert?.ip)} />
            <EntityRow label="Trace_ID" value={pickFirst(alert?.trace_id, alert?.event_id, alert?.external_alert_id)} />
          </div>


          <div style={{ marginTop: 46 }}>
            <h1 style={{display:'flex', justifyContent:'Center', color: '#ffffff', fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 900, letterSpacing: 0.3 }}>
              Log Classification
            </h1>
            <h2 style={{ margin: '20px 0 16px', color: '#ffffff', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 800, letterSpacing: 0.3 }}>
              KEY ENtities
            </h2>

            <InfoBox>
              {keyEntities.length > 0 ? (
                <div style={{ display: 'grid', gap: 8 }}>
                  {keyEntities.map((entity, index) => (
                    <div
                      key={`${entity}-${index}`}
                      title={entity}
                      style={{
                        minWidth: 0,
                        color: '#dce2f0',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 11,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {entity}
                    </div>
                  ))}
                </div>
              ) : (
                <div>-</div>
              )}
            </InfoBox>

            <div style={{ height: 20 }} />

            <h2 style={{ margin: '0 0 8px', color: '#ffffff', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 800, letterSpacing: 0.3 }}>
              MITRE ATT&CK
            </h2>
            <InfoBox>
              <div style={{ display: 'grid', gap: 9 }}>
                <div><span style={{ color: '#7e7e7e' }}>Tactic: </span>{logClassification?.mitre?.tactic || '-'}</div>
                <div><span style={{ color: '#7e7e7e' }}>Technique: </span>{logClassification?.mitre?.technique || '-'}</div>
                <div><span style={{ color: '#7e7e7e' }}>Subtechnique: </span>{logClassification?.mitre?.subTechnique || '-'}</div>
              </div>
            </InfoBox>
            <div style={{ height: 10 }} />
            <InfoBox>
              <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', alignItems: 'center' }}>
                <span style={{ color: '#99a3b8', fontSize: 10 }}>Confidence</span>
                <span style={{ color: '#ff4058', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 900 }}>{confidenceLabel}</span>
              </div>
            </InfoBox>

            <InfoBox>
              <div>Log source : {source}</div>
            </InfoBox>
            <div style={{ height: 10 }} />
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
            </div>
          </div>
        </aside>
        {/* Main Pannel */}
        <main style={{ display: 'grid', gap: 16, minWidth: 100 }}>
          <section style={{ ...panelStyle, minHeight: 246, padding: 26 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <Sparkles size={15} color="#48c7ff" />
              <h2 style={{ margin: 0, color: '#ffffff', fontSize: 13, fontWeight: 800 }}>Agent Analysis Summary</h2>
            </div>
            <p style={{ margin: '0 0 18px', maxWidth: 520, color: '#c3cad9', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {analysisSummary}
            </p>
            <div style={{ display: 'flex', alignItems: 'end', gap: 26 }}>
              {/* <div>
                <div style={{ color: '#99a3b8', fontSize: 10, marginBottom: 6 }}>Verdict</div>
                <Chip tone="red">{verdict === 'Malicious' ? 'o Malicious' : verdict}</Chip>
              </div> */}
            </div>
          </section>

          <section style={{ ...panelStyle, minHeight: 194, padding: 26 }}>
            <h2 style={{ margin: '0 0 18px', color: '#ffffff', fontSize: 13, fontWeight: 800 }}>Conclusion</h2>
            <p style={{ margin: 0, color: '#c3cad9', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              <HighlightedConclusion value={conclusion} />
            </p>
          </section>

          {/* Behavior Factor */}
          <div>
            <h2 style={{ margin: '0 0 16px', color: '#ffffff', fontSize: 13, fontWeight: 800 }}>Behavior Analysis</h2>
            <div style={{ display: 'grid', gap: 12 }}>
              {behaviorFactors.length > 0 ? (
                behaviorFactors.map((factor, index) => (
                  <BehaviorFactorBlock key={`${factor?.factor || 'factor'}-${index}`} factor={factor} index={index} />
                ))
              ) : (
                <section style={{ ...panelStyle, minHeight: 120, padding: 24 }}>
                  <p style={{ margin: 0, color: '#c3cad9', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {behaviorAnalysis}
                  </p>
                </section>
              )}
            </div>
          </div>
        </main>

        <aside style={{ ...panelStyle, minHeight: 502, padding: 24 }}>
{/* 
          <div style={{ display: 'grid', gap: 14, marginTop: 28 }}>
            <div style={{ color: '#8f98ad', fontSize: 10, textAlign: 'right' }}>Confidence</div>
            {mitreRows.map((prediction, index) => (
              <div key={prediction?.id || index} style={{ display: 'grid', gridTemplateColumns: '1fr 42px', gap: 8, color: '#dce2f0', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
                <span>{pickFirst(prediction?.technique_id, prediction?.mitre_id, latestPrediction.technique_id, latestPrediction.mitre_id, 'T1059.001')}</span>
                <strong style={{ color: '#ffffff', textAlign: 'right' }}>{normalizeConfidence(pickFirst(prediction?.confidence, index === 0 ? confidence : null))}</strong>
              </div>
            ))}
          </div>

          <div style={{ height: 86 }} />

          <h2 style={{ margin: '0 0 26px', color: '#ffffff', fontFamily: 'JetBrains Mono, monospace', fontSize: 15, textAlign: 'center' }}>
            Analysis Action
          </h2>

          <div style={{ display: 'grid', gap: 28, color: '#dce2f0', fontSize: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr', gap: 12 }}>
              <span style={{ color: '#717b91' }}>Status</span>
              <strong style={{ color: '#ffffff' }}>{statusText(alert?.status)}</strong>
            </div>
            <div>
              <div style={{ color: '#717b91', marginBottom: 16 }}>Verdict</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <VerdictOption label="Benign" active={verdict === 'Benign'} />
                <VerdictOption label="Suspicious" active={verdict === 'Suspicious'} />
                <VerdictOption label="Malicious" active={verdict === 'Malicious'} />
              </div>
            </div>
          </div> */}
        </aside>
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
