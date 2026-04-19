import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  Bell,
  Bot,
  ExternalLink,
  FileWarning,
  Home,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Radio,
  Search,
  Snowflake,
} from 'lucide-react'
import bgImg from '../../bg-img-1.png'

const NAV = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
  { to: '/investigate', icon: Search, label: 'Investigate' },
  { to: '/agents', icon: Bot, label: 'Agents' },
  { to: '/incidents', icon: FileWarning, label: 'Incidents' },
  { to: '/sedr', icon: Radio, label: 'Send EDR' },
  { to: '/about-us', icon: FileWarning, label: 'About Us' },
]

export default function Layout() {
  const location = useLocation()
  const isHome = location.pathname === '/home'

  const [sidebarVisible, setSidebarVisible] = useState(!isHome)
  const [hover, setHover] = useState(false)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    setSidebarVisible(!isHome)
  }, [isHome])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const formattedDate = now
    .toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    .replaceAll('/', ' / ')
  const formattedTime = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        maxHeight: '100vh',
        backgroundImage: `url(${bgImg}), radial-gradient(circle at 80% 18%, rgba(40, 72, 155, 0.28), 
                        transparent 28%), radial-gradient(circle at 52% 5%, rgba(104, 92, 188, 0.14), transparent 16%)`,
        backgroundColor: '#020511',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: '#f7f8ff',
        overflow: 'visible',
      }}
    >
      <aside
        style={{
          width: sidebarVisible ? 210 : 80,
          minHeight: 'calc(99vh - 20px)',
          maxHeight: '100vh',
          margin: '10px 10px 10px 10px',
          background:
            'linear-gradient(180deg, rgba(111, 136, 250, 0.05), rgba(3, 6, 19, 0.52))',
          border: '1px solid rgba(224, 231, 255, 0.18)',
          borderRadius: '18px',
          boxShadow:
            'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 24px 80px rgba(0, 0, 0, 0.54)',
          backdropFilter: 'blur(22px) saturate(145%)',
          WebkitBackdropFilter: 'blur(22px) saturate(145%)',
          transition: 'width 0.6s ease, margin 0.6s ease, border-color 0.2s ease',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: sidebarVisible ? 'flex-start' : 'center',
          zIndex: 10,
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: 'fit-content',
          maxHeight: 'calc(200vh - 20px)',
        }}
      >
        <div
          style={{
            padding: sidebarVisible ? '32px 28px 42px' : '30px 0 42px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarVisible ? 'flex-start' : 'center',
            gap: 14,
            whiteSpace: 'nowrap',
            width: '100%',
          }}
        >
          <Snowflake size={24} strokeWidth={1.35} color="#f8fbff" />
          {sidebarVisible && (
            <div
              style={{
                fontSize: 18,
                fontWeight: 400,
                color: '#f8fbff',
                letterSpacing: 5,
                lineHeight: 1,
              }}
            >
              PEARL
            </div>
          )}
        </div>

        <nav style={{ padding: sidebarVisible ? '0 10px' : '0', flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: sidebarVisible ? 'stretch' : 'center', gap: sidebarVisible ? 0 : 7, overflowY: 'auto' }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: sidebarVisible ? 'flex-start' : 'center',
                gap: 14,
                minHeight: 34,
                margin: sidebarVisible ? '3px 0' : '0',
                padding: sidebarVisible ? '0 18px' : '8px',
                textDecoration: 'none',
                fontSize: 12,
                fontWeight: 400,
                color: isActive ? '#ffffff' : 'rgba(233, 236, 248, 0.76)',
                background: isActive
                  ? 'linear-gradient(100deg, rgba(77, 78, 145, 0.23), rgba(98, 56, 98, 0.28))'
                  : 'transparent',
                border: isActive ? '1px solid rgba(184, 183, 255, 0.18)' : '1px solid transparent',
                borderRadius: 8,
                boxShadow: isActive
                  ? 'inset 0 1px 0 rgba(255,255,255,0.08), 0 10px 30px rgba(69, 36, 88, 0.32)'
                  : 'none',
                backdropFilter: isActive ? 'blur(14px)' : 'none',
                WebkitBackdropFilter: isActive ? 'blur(14px)' : 'none',
                transition: 'color 0.18s ease, background 0.18s ease, border-color 0.18s ease',
                whiteSpace: 'nowrap',
                width: sidebarVisible ? '100%' : 'auto',
              })}
            >
              <Icon size={16} strokeWidth={1.75} />
              {sidebarVisible && <span style={{ flex: 1 }}>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div
          style={{
            padding: sidebarVisible ? '0 30px 24px' : '0 0 24px',
            color: '#f5f7ff',
            fontSize: 10,
            width: '100%',
          }}
        >
          {sidebarVisible && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 18,
                letterSpacing: 0.8,
                whiteSpace: 'nowrap',
              }}
            >
              <span>{formattedDate}</span>
              <span>{formattedTime}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setSidebarVisible(!sidebarVisible)}
            style={{
              width: '100%',
              marginTop: 22,
              padding: sidebarVisible ? 0 : '10px 0',
              border: 'none',
              background: 'transparent',
              color: '#f8fbff',
              fontSize: 10,
              letterSpacing: 0.9,
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarVisible ? 'space-between' : 'center',
              cursor: 'pointer',
            }}
          >
            {sidebarVisible ? <span style={{ color: '#f5f7ff52' }}>CLOSE</span> : <ExternalLink size={13} strokeWidth={1.75} />}
            {sidebarVisible && <ExternalLink size={13} strokeWidth={1.75} />}
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* <button
          type="button"
          aria-label={sidebarVisible ? 'Close navigation' : 'Open navigation'}
          onClick={() => setSidebarVisible(!sidebarVisible)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            position: 'fixed',
            bottom: 48,
            left: sidebarVisible ? 196 : 60,
            zIndex: 50,
            width: 42,
            height: 142,
            borderRadius: '0 18px 18px 0',
            border: '1px solid rgba(224, 231, 255, 0.16)',
            borderLeft: 'none',
            background: hover ? 'rgba(20, 26, 52, 0.58)' : 'rgba(7, 11, 28, 0.42)',
            color: '#f8fbff',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'left 0.3s ease, background 0.2s ease, box-shadow 0.2s ease',
            boxShadow: hover ? '0 14px 40px rgba(0,0,0,0.45)' : '0 8px 28px rgba(0,0,0,0.32)',
            backdropFilter: 'blur(18px) saturate(140%)',
            WebkitBackdropFilter: 'blur(18px) saturate(140%)',
          }}
        >
          {sidebarVisible ? <PanelLeftClose size={18} strokeWidth={1.5} /> : <PanelLeftOpen size={18} strokeWidth={1.5} />}
        </button> */}

        <main
          style={{
            flex: 1,
            overflow: 'auto',
            padding: 20,
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.01))',
          }}
        >
          <div
            style={{
              minHeight: 'calc(100vh - 40px)',
              border: '1px solid rgba(224, 231, 255, 0.07)',
              borderRadius: 16,
              background: 'rgba(5, 9, 24, 0.28)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
