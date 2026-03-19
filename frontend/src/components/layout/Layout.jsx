import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Shield, LayoutDashboard, Bell, Search, Bot, FileWarning, Activity } from 'lucide-react'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/alerts', icon: Bell, label: 'Alert Queue' },
  { to: '/investigate', icon: Search, label: 'Investigate' },
  { to: '/agents', icon: Bot, label: 'Agents' },
  { to: '/incidents', icon: FileWarning, label: 'Incidents' },
]

export default function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0C0C0C' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: '#111111', borderRight: '1px solid #1f2937',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ margin: '0 auto', padding: '20px 16px', borderBottom: '1px solid #1f2937', display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* <Shield size={22} color="#00d4ff" /> */}
          <div>
            <div style={{ fontFamily: 'fantasy', fontSize: 35, fontWeight: 700, color: '#f0f0f0', letterSpacing: 4 }}>NTSeiei</div>
            <div style={{ fontSize: 10, color: '#6b7280', letterSpacing: 2 }}>PLATFORM v3.0</div>
          </div>
        </div>

        {/* Live indicator */}
        {/* <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid #1f2937' }}>
          <span className="live-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#00d48a', display: 'inline-block' }} />
          <span style={{ fontSize: 10, color: '#00d48a', fontFamily: 'JetBrains Mono, monospace', letterSpacing: 1 }}>LIVE MONITORING</span>
        </div> */}

        {/* Nav */}
        <nav style={{ padding: '19px 0', flex: 1 }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 15,
              margin: '10px 0px 0px 16px',
              borderRadius: '8px',
              padding: '10px 16px', textDecoration: 'none',
              fontSize: 14, fontWeight: 300,
              color: isActive ? '#ffffff' : '#9ca3af',
              background: isActive ? 'linear-gradient(to left, rgba(16, 0, 247, 0.37), rgba(53, 53, 69, 0.18),rgba(53, 53, 69, 0.18))' : 'transparent',
              borderRight: isActive ? '1px solid #0044ff' : '3px solid transparent',
              borderRadius: isActive ? '0px 20px 20px 0' : '8px',
              transition: 'all 0.15s',
            })}>
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #1f2937', fontSize: 10, color: '#374151', fontFamily: 'JetBrains Mono, monospace' }}>
          <Activity size={10} style={{ display: 'inline', marginRight: 4 }} />
          API: localhost:8000
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto', background: '#0C0C0C' }}>
        <Outlet />
      </main>
    </div>
  )
}
