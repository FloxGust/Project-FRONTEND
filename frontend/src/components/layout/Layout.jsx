import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Activity, Bell, Bot, FileWarning, Home, LayoutDashboard, Search } from 'lucide-react'

const NAV = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/alerts', icon: Bell, label: 'Alert Queue' },
  { to: '/investigate', icon: Search, label: 'Investigate' },
  { to: '/agents', icon: Bot, label: 'Agents' },
  { to: '/incidents', icon: FileWarning, label: 'Incidents'},
  { to: '/about-us', icon: FileWarning, label: 'About Us' },
]

export default function Layout() {
  const location = useLocation()
  const isHome = location.pathname === '/home'

  const [sidebarVisible, setSidebarVisible] = useState(!isHome)
  const [hover, setHover] = useState(false)

  useEffect(() => {
    setSidebarVisible(!isHome)
  }, [isHome])

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0c0c0c' }}>
      <aside
        style={{
          width: sidebarVisible ? 220 : 0,
          background: '#111',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
        }}
      >
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #1f2937' }}>
          <div style={{ fontFamily: 'fantasy', fontSize: 28, color: '#f0f0f0', letterSpacing: 3 }}>PearlGuard</div>
          <div style={{ fontSize: 10, color: '#6b7280' }}>PLATFORM v1.0</div>
        </div>

        <nav style={{ padding: '10px 0', flex: 1 }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 15,
                margin: '10px 0 0 16px',
                padding: '10px 16px',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 300,
                color: isActive ? '#ffffff' : '#9ca3af',
                background: isActive
                  ? 'linear-gradient(to left, rgba(16, 0, 247, 0.37), rgba(53, 53, 69, 0.18), rgba(53, 53, 69, 0.0))'
                  : 'transparent',
                borderRight: isActive ? '1px solid #0044ff' : '3px solid transparent',
                borderRadius: isActive ? '0 20px 20px 0' : '8px',
                transition: 'all 0.15s',
              })}
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: 12, borderTop: '1px solid #1f2937', fontSize: 10, color: '#374151' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4, marginTop: 4 }}>
            <Activity size={12} style={{ marginRight: 4 }} />
            API: http://127.0.0.1:8000
          </div>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <button
          onClick={() => setSidebarVisible(!sidebarVisible)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            position: 'fixed',
            bottom: 55,
            left: 1,
            zIndex: 50,
            width: 42,
            height: 160,
            borderRadius: 14,
            border: '1px solid #1f2937',
            borderTop: 'none',
            borderLeft: 'none',
            borderBottom: 'none',
            background: hover ? 'rgba(255, 255, 255, 0)' : 'rgba(0, 0, 0, 0.8)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 5,
            transition: 'all 0.25s ease',
            boxShadow: '0 0 12px rgba(0,0,0,0.5)',
          }}
        >
          <span
            style={{
              width: 20,
              height: 2,
              background: '#fff',
              transform: sidebarVisible ? 'rotate(45deg) translateY(1px)' : 'none',
              transition: '0.3s',
            }}
          />
          <span
            style={{
              width: 20,
              height: 2,
              background: '#fff',
              opacity: sidebarVisible ? 0 : 1,
              transition: '0.3s',
            }}
          />
          <span
            style={{
              width: 20,
              height: 2,
              background: '#fff',
              transform: sidebarVisible ? 'rotate(-220deg) translateY(2px)' : 'none',
              transition: '0.3s',
            }}
          />
        </button>
        {/* <div style={{ position: 'relative', width: 18, height: 18 }}>
          <FileWarning size={18} />
          <Lock size={10} style={{
            position: 'absolute',
            bottom: -2,
            right: -2
          }} />
        </div>     */}
        <main style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
