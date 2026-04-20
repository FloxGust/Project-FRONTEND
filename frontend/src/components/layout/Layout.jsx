import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
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
  LogOut,
  CircleUserRound,
} from 'lucide-react'
import bgImg from '../../image 38.png'
import { clearSession, getAuthenticatedUser } from '../../lib/auth'

const NAV = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/alerts', icon: Bot, label: 'Investigate' },
  // { to: '/investigate', icon: Search, label: 'Investigate' },
  // { to: '/agents', icon: Bot, label: 'Agents' },
  // { to: '/incidents', icon: FileWarning, label: 'Incidents' },
  { to: '/sedr', icon: Radio, label: 'Send Logs' },
  { to: '/about-us', icon: FileWarning, label: 'About Us' },
]

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/home'

  const [sidebarVisible, setSidebarVisible] = useState(!isHome)
  const [hover, setHover] = useState(false)
  const [now, setNow] = useState(() => new Date())
  const username = getAuthenticatedUser()

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

  const handleLogout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

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
      {/* Navbar */}
      <aside
        style={{
          width: sidebarVisible ? 210 : 80,
          minHeight: 'calc(99vh - 20px)',
          margin: '10px 10px 10px 10px',
          background:
            'linear-gradient(180deg, rgba(111, 136, 250, 0.09), rgba(3, 6, 19, 0.62))',
          border: '1px solid rgba(224, 231, 255, 0.12)',
          borderRadius: '18px',
          boxShadow:
            'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 24px 80px rgba(0, 0, 0, 0.54)',
          // backdropFilter: 'blur(12px) saturate(100%)',
          // WebkitBackdropFilter: 'blur(22px) saturate(145%)',
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
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'start',
              flexDirection: 'column',
              marginBottom: 62,
            }}
          >
            {sidebarVisible && username && (
              <div
                style={{
                  marginBottom: 12,
                  // color: "rgba(240, 244, 255, 0.72)",
                  letterSpacing: 0.5,
                  fontSize: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 25, // ระยะห่าง icon กับ text
                  }}
                >
                  <CircleUserRound size={16} strokeWidth={1.75} />
                  <span>{username}</span>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={handleLogout}
              style={{
                width: '100%',
                marginTop: 1,
                padding:'8px 0' ,
                // border: '1px solid rgba(224, 231, 255, 0.18)',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.02)',
                color: '#f8fbff',
                fontSize: 10,
                letterSpacing: 4,
                display: 'flex',
                alignItems: 'center',
                // justifyContent: 'start',
                cursor: 'pointer',
            }}
            >
              {sidebarVisible && <LogOut size={13} strokeWidth={1.75} />}
              {sidebarVisible && <span style={{margin:'0 0 0 30px'}}>LOGOUT</span>}
            </button>
          </div>
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
              marginTop: 16,
              padding: sidebarVisible ? '8px 0' : '10px 0',
              border: '1px solid rgba(224, 231, 255, 0.18)',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.02)',
              color: '#f8fbff',
              fontSize: 10,
              letterSpacing: 0.9,
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarVisible ? 'center' : 'center',
              gap: 8,
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
        {/* main */}
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
              border: '1px solid rgba(255, 236, 246, 0.18)',
              borderRadius: 40, //16px
              background: 'rgba(5, 9, 24, 0.6)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
