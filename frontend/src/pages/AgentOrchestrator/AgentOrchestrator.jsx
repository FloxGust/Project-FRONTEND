import { useState, useEffect } from 'react'
import { Bot, Play, RefreshCw, CheckCircle, XCircle, Loader } from 'lucide-react'
import { agentsApi } from '../../api'

const AGENTS = [
  { id: 'triage',      name: 'Auto-Triage Agent',      desc: 'Analyzes alerts and recommends triage decisions', color: '#00d4ff' },
  { id: 'investigate', name: 'Investigation Agent',     desc: 'Deep-dives into incidents with full context',     color: '#ffd700' },
  { id: 'hunt',        name: 'Threat Hunt Agent',       desc: 'Proactively hunts threats in the environment',    color: '#ff8c00' },
  { id: 'enrich',      name: 'IOC Enrichment Agent',    desc: 'Enriches IOCs via VirusTotal, Shodan, MISP',      color: '#00d48a' },
  { id: 'report',      name: 'Report Generation Agent', desc: 'Generates structured incident reports',           color: '#a78bfa' },
]

function StatusIcon({ status }) {
  if (status === 'completed') return <CheckCircle size={14} color="#00d48a" />
  if (status === 'failed')    return <XCircle     size={14} color="#ff3b3b" />
  if (status === 'running')   return <Loader      size={14} color="#ffd700" style={{ animation: 'spin 1s linear infinite' }} />
  return <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#a9c8f9' }} />
}

export default function AgentOrchestrator() {
  const [jobs, setJobs] = useState([])
  const [target, setTarget] = useState('')
  const [running, setRunning] = useState({})

  const runAgent = async (agentId) => {
    if (!target) { alert('Please enter a target first'); return }
    setRunning(r => ({ ...r, [agentId]: true }))
    try {
      const r = await agentsApi.run({ agent_type: agentId, target })
      setJobs(j => [{ job_id: r.data.job_id, agent_type: agentId, target, status: 'queued', progress: 0, created_at: new Date().toISOString() }, ...j])
      // Poll this job
      const poll = setInterval(async () => {
        try {
          const jr = await agentsApi.getJob(r.data.job_id)
          setJobs(j => j.map(job => job.job_id === jr.data.job_id ? jr.data : job))
          if (jr.data.status === 'completed' || jr.data.status === 'failed') {
            clearInterval(poll)
            setRunning(r => ({ ...r, [agentId]: false }))
          }
        } catch { clearInterval(poll); setRunning(r => ({ ...r, [agentId]: false })) }
      }, 90000)
    } catch { setRunning(r => ({ ...r, [agentId]: false })) }
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: '#6b7280', fontFamily: 'JetBrains Mono, monospace', letterSpacing: 2, textTransform: 'uppercase' }}>AUTOMATION</div>
        <h1 style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 600, color: '#f9fafb' }}>Agent Orchestrator</h1>
      </div>

      {/* Target input */}
      <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8, padding: 16, marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#6b7280', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>TARGET:</span>
        <input value={target} onChange={e => setTarget(e.target.value)} placeholder="Alert ID, IP, incident ID, hash..." style={{ flex: 1, background: '#0d1117', border: '1px solid #1f2937', borderRadius: 6, padding: '8px 12px', color: '#e5e7eb', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', outline: 'none' }} />
      </div>

      {/* Agent cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, marginBottom: 24 }}>
        {AGENTS.map(agent => (
          <div key={agent.id} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ background: `${agent.color}18`, borderRadius: 8, padding: 8 }}>
                  <Bot size={16} color={agent.color} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb' }}>{agent.name}</div>
                  <div style={{ fontSize: 10, color: '#6b7280', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase' }}>READY</div>
                </div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 14, lineHeight: 1.5 }}>{agent.desc}</div>
            <button onClick={() => runAgent(agent.id)} disabled={running[agent.id]} style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, background: running[agent.id] ? '#1f2937' : `${agent.color}18`, border: `1px solid ${agent.color}40`, color: running[agent.id] ? '#6b7280' : agent.color, borderRadius: 6, padding: '8px', cursor: running[agent.id] ? 'not-allowed' : 'pointer', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
              <Play size={11} /> {running[agent.id] ? 'RUNNING...' : 'RUN AGENT'}
            </button>
          </div>
        ))}
      </div>

      {/* Job log */}
      {jobs.length > 0 && (
        <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #1f2937', fontSize: 12, color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }}>JOB LOG</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1f2937' }}>
                {['Status', 'Agent', 'Target', 'Progress', 'Time'].map(h => (
                  <th key={h} style={{ padding: '8px 16px', textAlign: 'left', fontSize: 10, color: '#6b7280', fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.job_id} style={{ borderBottom: '1px solid #1f2937' }}>
                  <td style={{ padding: '10px 16px' }}><StatusIcon status={job.status} /></td>
                  <td style={{ padding: '10px 16px', fontSize: 12, color: '#e5e7eb', fontFamily: 'JetBrains Mono, monospace' }}>{job.agent_type}</td>
                  <td style={{ padding: '10px 16px', fontSize: 12, color: '#00d4ff', fontFamily: 'JetBrains Mono, monospace' }}>{job.target}</td>
                  <td style={{ padding: '10px 16px', minWidth: 120 }}>
                    <div style={{ background: '#1f2937', borderRadius: 4, height: 4 }}>
                      <div style={{ height: '100%', background: '#00d4ff', width: `${job.progress || 0}%`, borderRadius: 4, transition: 'width 0.4s' }} />
                    </div>
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 11, color: '#6b7280', fontFamily: 'JetBrains Mono, monospace' }}>{new Date(job.created_at).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
