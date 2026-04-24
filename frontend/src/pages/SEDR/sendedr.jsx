import { useMemo, useRef, useState } from 'react'
import { CheckCircle, FileJson, Loader, Play, Radio, Send, Square, XCircle } from 'lucide-react'

const DEFAULT_ENDPOINT = import.meta.env.VITE_SEDR_PUBLISH_URL || '/sedr-publish/api/publish-js'

const samplePayload = JSON.stringify(
  {
    data: {
      incidents: {
        edges: [
          {
            node: {
              id: 'incident-001',
              title: 'Suspicious process execution',
              severity: 'High',
              host: 'endpoint-01',
              detected_time: new Date().toISOString(),
            },  
          },
        ],
      },
    },
  },
  null,
  2
)

const styles = {
  ':root': {
    '--background': '#111111',
  },
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const buttonBase = {
  height: 38,
  borderRadius: 6,
  border: '1px solid #263449',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '0 14px',
  color: '#e5e7eb',
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: 12,
  cursor: 'pointer',
}

const inputStyle = {
  height: 38,
  borderRadius: 6,
  border: '1px solid #263449',
  background: '#080d18',
  color: '#e5e7eb',
  padding: '0 6px 0 10px',
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: 12,
  outline: 'none',
}

const extractNodes = (payload) => {
  if (Array.isArray(payload)) return payload
  if (payload?.node && typeof payload.node === 'object') return [payload.node]

  const edges = payload?.data?.incidents?.edges
  if (Array.isArray(edges)) {
    return edges.map((edge) => edge?.node).filter(Boolean)
  }

  const nodes = payload?.nodes || payload?.incidents || payload?.logs
  if (Array.isArray(nodes)) {
    return nodes.map((item) => item?.node || item).filter(Boolean)
  }

  if (payload && typeof payload === 'object') return [payload]
  return []
}

const parseLogs = (text) => {
  if (!text.trim()) return { nodes: [], error: 'Paste JSON before sending logs.' }

  try {
    const payload = JSON.parse(text)
    const nodes = extractNodes(payload)
    if (!nodes.length) return { nodes: [], error: 'No log nodes found in this JSON.' }
    return { nodes, error: '' }
  } catch (error) {
    return { nodes: [], error: error.message || 'Invalid JSON.' }
  }
}

const StatusIcon = ({ status }) => {
  if (status === 'success') return <CheckCircle size={15} color="#22c55e" />
  if (status === 'failed') return <XCircle size={15} color="#ef4444" />
  if (status === 'sending') return <Loader size={15} color="#38bdf8" style={{ animation: 'spin 1s linear infinite' }} />
  return <Radio size={15} color="#64748b" />
}

export default function SendEdr() {
  const [endpoint, setEndpoint] = useState(DEFAULT_ENDPOINT)
  const [subject, setSubject] = useState('agentAI.Type')
  const [delaySeconds, setDelaySeconds] = useState(10)
  const [jsonText, setJsonText] = useState(samplePayload)
  const [results, setResults] = useState([])
  const [sending, setSending] = useState(false)
  const stopRef = useRef(false)

  const parsed = useMemo(() => parseLogs(jsonText), [jsonText])
  const nodes = parsed.nodes
  const sentCount = results.filter((row) => row.status === 'success').length
  const failedCount = results.filter((row) => row.status === 'failed').length

  const publishNode = async (node, index, total) => {
    const requestId = `${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`
    const payload = {
      subject,
      message: { node },
    }

    setResults((rows) => [
      {
        id: requestId,
        index,
        total,
        incidentId: node?.id || node?.incident_id || node?.external_alert_id || '-',
        status: 'sending',
        statusCode: '-',
        response: 'Sending...',
        time: new Date().toLocaleTimeString(),
      },
      ...rows,
    ])

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const text = await response.text()
      let responseText = text
      try {
        responseText = JSON.stringify(JSON.parse(text))
      } catch {
        responseText = text || response.statusText
      }

      setResults((rows) =>
        rows.map((row) =>
          row.id === requestId
            ? {
                ...row,
                status: response.ok ? 'success' : 'failed',
                statusCode: response.status,
                response: responseText,
              }
            : row
        )
      )
    } catch (error) {
      setResults((rows) =>
        rows.map((row) =>
          row.id === requestId
            ? {
                ...row,
                status: 'failed',
                statusCode: 'ERR',
                response: error.message || 'Request failed',
              }
            : row
        )
      )
    }
  }

  const sendLogs = async (mode) => {
    const { nodes: parsedNodes, error } = parseLogs(jsonText)
    if (error) {
      setResults((rows) => [
        {
          id: `${Date.now()}-parse-error`,
          index: 0,
          total: 0,
          incidentId: '-',
          status: 'failed',
          statusCode: 'JSON',
          response: error,
          time: new Date().toLocaleTimeString(),
        },
        ...rows,
      ])
      return
    }

    const queue = mode === 'one' ? parsedNodes.slice(0, 1) : parsedNodes
    stopRef.current = false
    setSending(true)

    for (let index = 0; index < queue.length; index += 1) {
      if (stopRef.current) break
      await publishNode(queue[index], index + 1, queue.length)
      if (index < queue.length - 1 && !stopRef.current) {
        await sleep(Math.max(0, Number(delaySeconds) || 0) * 1000)
      }
    }

    setSending(false)
  }

  const stopSending = () => {
    stopRef.current = true
    setSending(false)
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 40px)', padding: 24, color: '#f8fafc' }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ color: '#64748b', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' }}>
          SEND PUBLISHER
        </div>
        <h1 style={{ margin: '5px 0 0', fontSize: 24, fontWeight: 700 }}>Simulate Send Log to Agents</h1>
      </div>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 16,
          alignItems: 'start',
        }}
      >
        <div style={{  background: '#111111', border: '1px solid #1f2a44', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 150px', gap: 10, marginBottom: 10 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ color: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>ENDPOINT</span>
              <input value={endpoint} onChange={(event) => setEndpoint(event.target.value)} style={inputStyle} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ color: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono, monospace'}}>DELAY SEC</span>
              <input
                type="number"
                min="0"
                value={delaySeconds}
                onChange={(event) => setDelaySeconds(event.target.value)}
                style={inputStyle}
              />
            </label>
          </div>

          <label style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
            <span style={{ color: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>SUBJECT</span>
            <input value={subject} onChange={(event) => setSubject(event.target.value)} style={inputStyle} />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ color: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>JSON LOGS</span>
            <textarea
              value={jsonText}
              onChange={(event) => setJsonText(event.target.value)}
              spellCheck={false}
              style={{
                minHeight: 420,
                resize: 'vertical',
                borderRadius: 8,
                border: '1px solid #263449',
                background: '#050914',
                color: '#dbeafe',
                padding: 14,
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 12,
                lineHeight: 1.55,
                outline: 'none',
              }}
            />
          </label>
        </div>

        <div style={{ display: 'grid', gap: 14 }}>
          <div style={{ background: '#111111', border: '1px solid #1f2a44', borderRadius: 8, padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, marginBottom: 14 }}>
              {[
                ['NODES', nodes.length, '#38bdf8'],
                ['SENT', sentCount, '#22c55e'],
                ['FAILED', failedCount, '#ef4444'],
              ].map(([label, value, color]) => (
                <div key={label} style={{ border: '1px solid #263449', borderRadius: 8, padding: 12, background: '#080d18' }}>
                  <div style={{ color: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}>{label}</div>
                  <div style={{ color, fontSize: 26, fontWeight: 800, marginTop: 4 }}>{value}</div>
                </div>
              ))}
            </div>

            {parsed.error && (
              <div style={{ marginBottom: 12, color: '#fecaca', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.38)', borderRadius: 6, padding: 10, fontSize: 12 }}>
                {parsed.error}
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <button
                onClick={() => sendLogs('one')}
                disabled={sending || !nodes.length}
                style={{ ...buttonBase, background: sending || !nodes.length ? '#111827' : '#0f2f2e', borderColor: '#14584f', color: sending || !nodes.length ? '#64748b' : '#67e8f9' }}
              >
                <Send size={14} /> SEND ONE
              </button>
              <button
                onClick={() => sendLogs('all')}
                disabled={sending || !nodes.length}
                style={{ ...buttonBase, background: sending || !nodes.length ? '#111827' : '#172554', borderColor: '#1d4ed8', color: sending || !nodes.length ? '#64748b' : '#bfdbfe' }}
              >
                <Play size={14} /> SEND ALL
              </button>
              <button
                onClick={stopSending}
                disabled={!sending}
                style={{ ...buttonBase, background: sending ? '#3b1119' : '#111827', borderColor: sending ? '#7f1d1d' : '#263449', color: sending ? '#fecaca' : '#64748b' }}
              >
                <Square size={13} /> STOP
              </button>
              <button
                onClick={() => setResults([])}
                style={{ ...buttonBase, background: '#111827' }}
              >
                CLEAR
              </button>
            </div>
          </div>
            {/* BackGround Pannel Send */}
          <div style={{ background: '#0e0f0f', border: '1px solid #1f2a44', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid #1f2a44', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileJson size={15} color="#93c5fd" />
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#cbd5e1' }}>PUBLISH RESULT</span>
            </div>

            <div style={{ maxHeight: 420, overflow: 'auto' }}>
              {results.length === 0 && (
                <div style={{ padding: 28, color: '#64748b', fontSize: 13, textAlign: 'center' }}>No publish result yet.</div>
              )}

              {results.map((row) => (
                <div key={row.id} style={{ display: 'grid', gridTemplateColumns: '22px 72px minmax(0, 1fr)', gap: 10, padding: 12, borderBottom: '1px solid #1f2a44' }}>
                  <StatusIcon status={row.status} />
                  <div style={{ color: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
                    [{row.index}/{row.total}]
                    <div style={{ color: '#64748b', marginTop: 4 }}>{row.statusCode}</div>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: '#e2e8f0', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.incidentId}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.response}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
