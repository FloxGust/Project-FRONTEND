import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation, useParams } from 'react-router-dom'
import { alertsApi } from '../../api'

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
  const [bundle, setBundle] = useState(null)
  const activeSection = location.pathname.endsWith('/context')
    ? 'Context'
    : location.pathname.endsWith('/summary')
      ? 'Summary'
      : 'Detail'

  useEffect(() => {
    const parsed = String(alertId || '').trim()
    if (!parsed) {
      setBundle(null)
      return
    }

    let cancelled = false
    const loadBundleStatus = async () => {
      try {
        const response = await alertsApi.details(parsed)
        if (!cancelled) setBundle(response?.data || null)
      } catch {
        if (!cancelled) setBundle(null)
      }
    }

    loadBundleStatus()
    return () => {
      cancelled = true
    }
  }, [alertId])

  const normalizeStatus = (value) => String(value || '').trim().toUpperCase()
  const predictionStatus = normalizeStatus(
    bundle?.result_type_prediction?.status
    || bundle?.predictions?.[0]?.status
  )
  const recommendationStatus = normalizeStatus(
    bundle?.recommendation?.status
    || bundle?.recommendations?.[0]?.status
  )

  const passContext = predictionStatus !== 'RECEIVED'
  const passCompleted = recommendationStatus !== 'RECEIVED'

  const inactiveTabs = useMemo(
    () => ({
      context: !alertId || passContext,
      summary: !alertId || passCompleted,
    }),
    [alertId, passContext, passCompleted]
  )

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
        {tabs.map((tab) => {
          const isInactive = Boolean(inactiveTabs[tab.key])
          if (isInactive) {
            return (
              <div
                key={tab.key}
                style={{
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 52,
                  color: '#7f879a',
                  textDecoration: 'none',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: tab.key === 'summary' ? 1 : 0.2,
                  cursor: 'not-allowed',
                }}
              >
                <span style={{ opacity: 0.72 }}>{tab.label}</span>
                <span style={{ marginLeft: 8, fontSize: 9, letterSpacing: 0.5, color: '#4b505e52' }}>
                  INACTIVE
                </span>
              </div>
            )
          }

          return (
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
                fontSize: 14,
                fontWeight: 800,
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
          )
        })}
      </nav>
    </header>
  )
}
