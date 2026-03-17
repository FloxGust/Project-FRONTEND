import { useState, useEffect } from 'react'
import { Plus, FileWarning } from 'lucide-react'
import { incidentsApi } from '../../api'

export default function Incidents() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', severity: 'high', description: '' })

  const load = () => {
    incidentsApi.list()
      .then(r => setIncidents(r.data))
      .catch(() => setIncidents([
        { id: 'ir-001', title: 'Ransomware Incident - Finance Dept', severity: 'critical', status: 'investigating', assignee: 'analyst', created_at: new Date().toISOString() },
        { id: 'ir-002', title: 'Credential Compromise - Domain Admin', severity: 'high', status: 'contained', assignee: 'admin', created_at: new Date().toISOString() },
      ]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const createIncident = async () => {
    try {
      const r = await incidentsApi.create(form)
      setIncidents(i => [r.data, ...i])
      setShowCreate(false)
      setForm({ title: '', severity: 'high', description: '' })
    } catch {
      setIncidents(i => [{ id: `ir-${Date.now()}`, ...form, status: 'open', created_at: new Date().toISOString() }, ...i])
      setShowCreate(false)
    }
  }

  const STATUS_COLOR = { open: '#ffd700', investigating: '#ff8c00', contained: '#00d4ff', closed: '#6b7280' }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 11, color: '#6b7280', fontFamily: 'JetBrains Mono, monospace', letterSpacing: 2, textTransform: 'uppercase' }}>CASE MANAGEMENT</div>
          <h1 style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 600, color: '#f9fafb' }}>Incidents</h1>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#00d4ff18', border: '1px solid #00d4ff40', color: '#00d4ff', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
          <Plus size={13} /> NEW INCIDENT
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div style={{ background: '#111827', border: '1px solid #00d4ff40', borderRadius: 8, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: '#00d4ff', fontFamily: 'JetBrains Mono, monospace', marginBottom: 14 }}>CREATE INCIDENT</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Incident title..." style={{ background: '#0d1117', border: '1px solid #1f2937', borderRadius: 6, padding: '9px 12px', color: '#e5e7eb', fontSize: 13, outline: 'none' }} />
            <select value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))} style={{ background: '#0d1117', border: '1px solid #1f2937', borderRadius: 6, padding: '9px 12px', color: '#e5e7eb', fontSize: 13, outline: 'none' }}>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description..." rows={3} style={{ background: '#0d1117', border: '1px solid #1f2937', borderRadius: 6, padding: '9px 12px', color: '#e5e7eb', fontSize: 13, outline: 'none', resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCreate(false)} style={{ background: '#1f2937', border: '1px solid #374151', color: '#9ca3af', borderRadius: 6, padding: '7px 16px', cursor: 'pointer', fontSize: 12 }}>Cancel</button>
              <button onClick={createIncident} style={{ background: '#00d4ff18', border: '1px solid #00d4ff40', color: '#00d4ff', borderRadius: 6, padding: '7px 16px', cursor: 'pointer', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>CREATE</button>
            </div>
          </div>
        </div>
      )}

      {/* Incident list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading && <div style={{ textAlign: 'center', padding: 60, color: '#6b7280', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>Loading incidents...</div>}
        {incidents.map(inc => (
          <div key={inc.id} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'border-color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#374151'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#1f2937'}>
            <FileWarning size={18} color={STATUS_COLOR[inc.status] || '#6b7280'} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#e5e7eb', marginBottom: 2 }}>{inc.title}</div>
              <div style={{ fontSize: 11, color: '#6b7280', fontFamily: 'JetBrains Mono, monospace' }}>{inc.id} · {inc.assignee || 'unassigned'} · {new Date(inc.created_at).toLocaleDateString()}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className={`badge-${inc.severity}`} style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, textTransform: 'uppercase' }}>{inc.severity}</span>
              <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: STATUS_COLOR[inc.status] || '#6b7280', background: `${STATUS_COLOR[inc.status] || '#6b7280'}18`, border: `1px solid ${STATUS_COLOR[inc.status] || '#6b7280'}30`, textTransform: 'uppercase' }}>{inc.status}</span>
            </div>
          </div>
        ))}
        {!loading && incidents.length === 0 && <div style={{ textAlign: 'center', padding: 60, color: '#374151', fontSize: 13 }}>No incidents yet.</div>}
      </div>
    </div>
  )
}
