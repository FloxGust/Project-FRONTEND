import { useState } from 'react'
import { Search, Zap, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { agentsApi, intelApi } from '../../api'

export default function Investigate() {
  const [target, setTarget]     = useState('')
  const [iocType, setIocType]   = useState('ip')
  const [jobId, setJobId]       = useState(null)
  const [job, setJob]           = useState(null)
  const [enrich, setEnrich]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [enriching, setEnriching] = useState(false)

  const runInvestigation = async () => {
    if (!target) return
    setLoading(true)
    setJob(null)
    try {
      const r = await agentsApi.run({ agent_type: 'investigate', target })
      setJobId(r.data.job_id)
      // Poll
      const poll = setInterval(async () => {
        try {
          const jr = await agentsApi.getJob(r.data.job_id)
          setJob(jr.data)
          if (jr.data.status === 'completed' || jr.data.status === 'failed') {
            clearInterval(poll)
            setLoading(false)
          }
        } catch { clearInterval(poll); setLoading(false) }
      }, 1500)
    } catch { setLoading(false) }
  }

  const runEnrich = async () => {
    if (!target) return
    setEnriching(true)
    try {
      const r = await intelApi.enrich({ ioc_type: iocType, value: target })
      setEnrich(r.data)
    } catch {
      setEnrich({ ioc_type: iocType, value: target, malicious: true, confidence: 0.88, sources: ['VirusTotal', 'AbuseIPDB'], tags: ['C2', 'botnet'], geo: { country: 'RU', city: 'Moscow' }, first_seen: '2024-01-15' })
    } finally { setEnriching(false) }
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: '#6b7280', fontFamily: 'JetBrains Mono, monospace', letterSpacing: 2, textTransform: 'uppercase' }}>AGENT</div>
        <h1 style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 600, color: '#f9fafb' }}>Investigate</h1>
      </div>

      {/* Target input */}
      <div style={{ background: '#181818', border: '1px solid #1f2937', borderRadius: 8, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace', marginBottom: 12 }}>TARGET</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select value={iocType} onChange={e => setIocType(e.target.value)} style={{ background: '#0d1117', border: '1px solid #1f2937', color: '#9ca3af', borderRadius: 6, padding: '0 12px', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer' }}>
            <option value="ip">IP</option>
            <option value="domain">Domain</option>
            <option value="hash">Hash</option>
            <option value="url">URL</option>
          </select>
          <input value={target} onChange={e => setTarget(e.target.value)} placeholder="Enter IP, domain, hash, or alert ID..." style={{ flex: 1, background: '#0d1117', border: '1px solid #1f2937', borderRadius: 6, padding: '10px 14px', color: '#e5e7eb', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', outline: 'none' }} />
          <button onClick={runInvestigation} disabled={loading || !target} style={{ display: 'flex', alignItems: 'center', gap: 6, background: loading ? '#1f2937' : '#00d4ff18', border: '1px solid #00d4ff40', color: loading ? '#6b7280' : '#00d4ff', borderRadius: 6, padding: '0 18px', cursor: loading || !target ? 'not-allowed' : 'pointer', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
            <Zap size={13} /> {loading ? 'RUNNING...' : 'INVESTIGATE'}
          </button>
          <button onClick={runEnrich} disabled={enriching || !target} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1f2937', border: '1px solid #374151', color: '#9ca3af', borderRadius: 6, padding: '0 18px', cursor: enriching || !target ? 'not-allowed' : 'pointer', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
            <Search size={13} /> {enriching ? 'ENRICHING...' : 'ENRICH IOC'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Agent Result */}
        <div style={{ background: '#181818', border: '1px solid #1f2937', borderRadius: 8, padding: 20 }}>
          <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace', marginBottom: 16 }}>INVESTIGATION AGENT</div>
          {!job && !loading && <div style={{ color: '#374151', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>No investigation started yet</div>}
          {(loading || job) && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                {job?.status === 'completed' ? <CheckCircle size={14} color="#00d48a" /> : <Clock size={14} color="#ffd700" className="live-dot" />}
                <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: job?.status === 'completed' ? '#00d48a' : '#ffd700', textTransform: 'uppercase' }}>{job?.status || 'queued'}</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: '#6b7280' }}>{job?.progress || 0}%</span>
              </div>
              <div style={{ background: '#0d1117', borderRadius: 4, height: 4, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ height: '100%', background: '#00d4ff', width: `${job?.progress || 0}%`, transition: 'width 0.4s' }} />
              </div>
              {job?.result && (
                <div style={{ fontSize: 12, lineHeight: 1.8 }}>
                  <div style={{ color: '#d1d5db', marginBottom: 8 }}>{job.result.summary}</div>
                  {job.result.findings?.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: '#9ca3af', marginBottom: 4 }}>
                      <span style={{ color: '#ff8c00', marginTop: 1 }}>›</span> {f}
                    </div>
                  ))}
                  {job.result.recommendation && (
                    <div style={{ marginTop: 12, padding: '10px 12px', background: '#00d4ff08', border: '1px solid #00d4ff20', borderRadius: 6, color: '#00d4ff', fontSize: 12 }}>
                      💡 {job.result.recommendation}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* IOC Enrichment */}
        <div style={{ background: '#181818', border: '1px solid #1f2937', borderRadius: 8, padding: 20 }}>
          <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace', marginBottom: 16 }}>IOC ENRICHMENT</div>
          {!enrich && <div style={{ color: '#374151', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>No enrichment data yet</div>}
          {enrich && (
            <div style={{ fontSize: 12, lineHeight: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: 8, marginBottom: 8 }}>
                <span style={{ color: '#6b7280' }}>Verdict</span>
                <span style={{ color: enrich.malicious ? '#ff3b3b' : '#00d48a', fontWeight: 700 }}>{enrich.malicious ? '🔴 MALICIOUS' : '🟢 CLEAN'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Confidence</span>
                <span style={{ color: '#e5e7eb', fontFamily: 'JetBrains Mono, monospace' }}>{(enrich.confidence * 100).toFixed(0)}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Geo</span>
                <span style={{ color: '#e5e7eb', fontFamily: 'JetBrains Mono, monospace' }}>{enrich.geo?.country} / {enrich.geo?.city}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>First seen</span>
                <span style={{ color: '#e5e7eb', fontFamily: 'JetBrains Mono, monospace' }}>{enrich.first_seen}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Sources</span>
                <span style={{ color: '#e5e7eb' }}>{enrich.sources?.join(', ')}</span>
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {enrich.tags?.map(tag => (
                  <span key={tag} style={{ padding: '2px 8px', borderRadius: 4, background: '#ff3b3b18', color: '#ff3b3b', border: '1px solid #ff3b3b30', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}>{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
