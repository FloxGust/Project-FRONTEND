import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AlertTriangle, Search } from 'lucide-react'

import { alertsApi } from '../../api'

const toPretty = (value) => {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value)
}

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString()
}

export default function Investigate() {
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
  const contexts = useMemo(() => bundle?.contexts || [], [bundle])
  const investigations = useMemo(() => bundle?.investigations || [], [bundle])
  const recommendations = useMemo(() => bundle?.recommendations || [], [bundle])

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: '#6b7280', fontFamily: 'JetBrains Mono, monospace', letterSpacing: 2, textTransform: 'uppercase' }}>PAIAC</div>
        <h1 style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 600, color: '#f9fafb' }}>Investigate Alert</h1>
      </div>

      <div style={{ background: '#181818', border: '1px solid #1f2937', borderRadius: 8, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace', marginBottom: 12 }}>LOAD ALERT DETAILS</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            placeholder="Enter numeric alert id..."
            style={{
              flex: 1,
              background: '#0d1117',
              border: '1px solid #1f2937',
              borderRadius: 6,
              padding: '10px 14px',
              color: '#e5e7eb',
              fontSize: 13,
              fontFamily: 'JetBrains Mono, monospace',
              outline: 'none',
            }}
          />
          <button
            onClick={() => loadAlertBundle(target)}
            disabled={loading || !target}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: loading ? '#1f2937' : '#00d4ff18',
              border: '1px solid #00d4ff40',
              color: loading ? '#6b7280' : '#00d4ff',
              borderRadius: 6,
              padding: '0 18px',
              cursor: loading || !target ? 'not-allowed' : 'pointer',
              fontSize: 12,
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            <Search size={13} /> {loading ? 'LOADING...' : 'LOAD'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#2a1111', border: '1px solid #7f1d1d', color: '#fca5a5', borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 13 }}>
          {error}
        </div>
      )}

      {!bundle && !loading && !error && (
        <div style={{ background: '#181818', border: '1px solid #1f2937', borderRadius: 8, padding: 30, textAlign: 'center', color: '#6b7280' }}>
          Enter an alert ID to fetch data from server.
        </div>
      )}

      {bundle && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#181818', border: '1px solid #1f2937', borderRadius: 8, padding: 18 }}>
            <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace', marginBottom: 12 }}>ALERT SUMMARY</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase' }}>ID</div>
                <div style={{ fontSize: 13, color: '#e5e7eb', fontFamily: 'JetBrains Mono, monospace' }}>{alert?.id}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase' }}>External ID</div>
                <div style={{ fontSize: 13, color: '#e5e7eb', fontFamily: 'JetBrains Mono, monospace' }}>{alert?.external_alert_id || '-'}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase' }}>Severity</div>
                <div style={{ fontSize: 13, color: '#e5e7eb' }}>{alert?.severity || '-'}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase' }}>Status</div>
                <div style={{ fontSize: 13, color: '#e5e7eb' }}>{alert?.status || '-'}</div>
              </div>
            </div>
            <div style={{ marginTop: 12, fontSize: 14, color: '#f9fafb', fontWeight: 500 }}>{alert?.alert_name || '-'}</div>
            <div style={{ marginTop: 8, fontSize: 12, color: '#9ca3af' }}>
              Source: {alert?.source || '-'} | Detected: {formatDate(alert?.detected_time)}
            </div>
            {alert?.raw_log && (
              <pre
                style={{
                  marginTop: 12,
                  background: '#0d1117',
                  border: '1px solid #1f2937',
                  borderRadius: 6,
                  padding: 12,
                  fontSize: 11,
                  color: '#9ca3af',
                  whiteSpace: 'pre-wrap',
                  overflowX: 'auto',
                }}
              >
                {toPretty(alert.raw_log)}
              </pre>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: '#181818', border: '1px solid #1f2937', borderRadius: 8, padding: 18 }}>
              <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace', marginBottom: 12 }}>PREDICTIONS ({predictions.length})</div>
              {predictions.length === 0 ? (
                <div style={{ color: '#6b7280', fontSize: 12 }}>No prediction rows for this alert.</div>
              ) : (
                predictions.map((prediction) => (
                  <div key={prediction.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #1f2937' }}>
                    <div style={{ fontSize: 12, color: '#e5e7eb' }}>
                      #{prediction.id} | {prediction.main_tactic || '-'} | {prediction.main_technique || '-'}
                    </div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>
                      confidence: {prediction.confidence ?? '-'} | status: {prediction.status || '-'}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ background: '#181818', border: '1px solid #1f2937', borderRadius: 8, padding: 18 }}>
              <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace', marginBottom: 12 }}>CONTEXTS ({contexts.length})</div>
              {contexts.length === 0 ? (
                <div style={{ color: '#6b7280', fontSize: 12 }}>No context rows for this alert.</div>
              ) : (
                contexts.map((context) => (
                  <div key={context.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #1f2937' }}>
                    <div style={{ fontSize: 12, color: '#e5e7eb' }}>#{context.id} | host: {context.host || '-'} | user: {context.user_name || '-'}</div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>src_ip: {context.src_ip || '-'} | status: {context.status || '-'}</div>
                    {context.context_data && (
                      <pre style={{ marginTop: 8, background: '#0d1117', border: '1px solid #1f2937', borderRadius: 6, padding: 8, fontSize: 11, color: '#9ca3af', whiteSpace: 'pre-wrap' }}>
                        {toPretty(context.context_data)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: '#181818', border: '1px solid #1f2937', borderRadius: 8, padding: 18 }}>
              <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace', marginBottom: 12 }}>INVESTIGATIONS ({investigations.length})</div>
              {investigations.length === 0 ? (
                <div style={{ color: '#6b7280', fontSize: 12 }}>No investigation rows for this alert.</div>
              ) : (
                investigations.map((investigation) => (
                  <div key={investigation.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #1f2937' }}>
                    <div style={{ fontSize: 12, color: '#e5e7eb' }}>
                      #{investigation.id} | verdict: {investigation.verdict || '-'} | severity: {investigation.severity || '-'}
                    </div>
                    <div style={{ marginTop: 6, fontSize: 11, color: '#9ca3af' }}>{investigation.summary || '-'}</div>
                    <div style={{ marginTop: 6, fontSize: 11, color: '#6b7280' }}>status: {investigation.status || '-'} | confidence: {investigation.confidence || '-'}</div>
                  </div>
                ))
              )}
            </div>

            <div style={{ background: '#181818', border: '1px solid #1f2937', borderRadius: 8, padding: 18 }}>
              <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace', marginBottom: 12 }}>RECOMMENDATIONS ({recommendations.length})</div>
              {recommendations.length === 0 ? (
                <div style={{ color: '#6b7280', fontSize: 12 }}>No recommendation rows for this alert.</div>
              ) : (
                recommendations.map((recommendation) => (
                  <div key={recommendation.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #1f2937' }}>
                    <div style={{ fontSize: 12, color: '#e5e7eb' }}>
                      #{recommendation.id} | type: {recommendation.type || '-'} | status: {recommendation.status || '-'}
                    </div>
                    <pre
                      style={{
                        marginTop: 8,
                        background: '#0d1117',
                        border: '1px solid #1f2937',
                        borderRadius: 6,
                        padding: 8,
                        fontSize: 11,
                        color: '#9ca3af',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {recommendation.content || '-'}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, color: '#9ca3af', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
          <AlertTriangle size={14} /> Loading data from server...
        </div>
      )}
    </div>
  )
}
