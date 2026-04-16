import { NavLink, useLocation, useParams } from 'react-router-dom'

const tabs = [
  { key: 'detail', label: 'Detail', to: '' },
  { key: 'context', label: 'Context', to: 'context' },
  { key: 'summary', label: 'SUMMARY', to: 'summary' },
]

const buildInvestigatePath = (alertId, tabPath) => {
  const base = alertId ? `/investigate/${encodeURIComponent(alertId)}` : '/investigate'
  return tabPath ? `${base}/${tabPath}` : base
}

export default function InvestigateHeader() {
  const { alertId } = useParams()
  const location = useLocation()
  const activeSection = location.pathname.endsWith('/context')
    ? 'Context'
    : location.pathname.endsWith('/summary')
      ? 'Summary'
      : 'Detail'

  return (
    <header style={{ marginBottom: 18 }}>
      <div style={{ marginBottom: 12, color: '#9aa0a9', fontSize: 13, letterSpacing: 0.2 }}>
        For SOC / investigate / <span style={{ color: '#d6d8df' }}>{activeSection}</span>
      </div>

      <nav
        aria-label="Investigation sections"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(120px, 1fr))',
          alignItems: 'end',
          minHeight: 52,
          borderBottom: '1px solid rgba(79, 87, 109, 0.35)',
        }}
      >
        {tabs.map((tab) => (
          <NavLink
            key={tab.key}
            end={tab.key === 'detail'}
            to={buildInvestigatePath(alertId, tab.to)}
            style={({ isActive }) => ({
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 52,
              color: isActive ? '#ffffff' : '#d7d9e1',
              textDecoration: 'none',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: tab.key === 'summary' ? 1 : 0.2,
            })}
          >
            {({ isActive }) => (
              <>
                {tab.label}
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: -1,
                      width: 48,
                      height: 4,
                      borderRadius: 4,
                      background: '#5a2dff',
                      boxShadow: '0 0 14px rgba(90, 45, 255, 0.8)',
                    }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
