import { ArrowUpRight, Orbit, Radar, ShieldCheck, Sparkles, Workflow } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PearlguardLogo from '../../assets/image/PearlguardLogo.png'

const IS_PUBLIC_DOMAIN = String(import.meta.env.VITE_PUBLIC_DOMAIN || 'false').toLowerCase() === 'true'

const CONNECTION_GROUPS = [
  {
    key: 'database',
    label: 'Database',
    endpoints: [
      { key: 'db-local', label: '', url: IS_PUBLIC_DOMAIN ? '/db-local-proxy/' : '/db-proxy/' },
      // { key: 'db-public', label: 'db.paiac.store', url: 'https://db.paiac.store/', mode: 'no-cors' },
    ],
  },
  {
    key: 'agent',
    label: 'Agent',
    endpoints: [
      {
        key: 'agent-local',
        // label: 'localhost:9003',
        url: '/sedr-publish/api/publish-js',
        acceptedStatuses: [200, 405],
      },
    ],
  },
  {
    key: 'backend',
    label: 'Backend',
    endpoints: [
      { key: 'backend-current', label: '', url: '/api/alerts/stats' },
      // { key: 'backend-public', label: 'front.paiac.store', url: 'https://front.paiac.store/api/alerts/stats', mode: 'no-cors' },
    ],
  },
]

const TRUSTED = ['CROWDSTRIKE', 'SPLUNK', 'PALO ALTO', 'CLOUDFLARE', 'MICROSOFT', 'AWS']

const FEATURES = [
  {
    icon: Radar,
    title: 'Predictive Threat Radar',
    desc: 'Surface weak signals early, before alerts explode into critical incidents.',
  },
  {
    icon: Workflow,
    title: 'Autonomous Playbooks',
    desc: 'Contain, enrich, and escalate with adaptive flows built for SOC speed.',
  },
  {
    icon: ShieldCheck,
    title: 'Decision-Grade Confidence',
    desc: 'Every recommendation includes evidence trails and explainable AI scoring.',
  },
]

export default function Home() {
  const navigate = useNavigate()
  const [statusMap, setStatusMap] = useState({})
  const [isRefreshing, setIsRefreshing] = useState(false)
  const refreshStatusesRef = useRef(async () => {})

  const flattenedEndpoints = useMemo(
    () => CONNECTION_GROUPS.flatMap((group) => group.endpoints),
    []
  )

  useEffect(() => {
    let cancelled = false

    const checkEndpoint = async (endpoint) => {
      const controller = new AbortController()
      const timeoutId = window.setTimeout(() => controller.abort(), 4500)
      try {
        const response = await fetch(endpoint.url, {
          method: 'GET',
          mode: endpoint.mode || 'same-origin',
          cache: 'no-store',
          signal: controller.signal,
        })
        const isNoCors = endpoint.mode === 'no-cors'
        if (isNoCors) {
          return {
            state: 'degraded',
            code: 'opaque',
          }
        }

        const acceptedStatuses = Array.isArray(endpoint.acceptedStatuses) ? endpoint.acceptedStatuses : []
        if (acceptedStatuses.includes(response.status)) {
          return {
            state: 'online',
            code: String(response.status),
          }
        }

        if (!response.ok) {
          return {
            state: 'offline',
            code: String(response.status),
          }
        }

        return {
          state: 'online',
          code: String(response.status),
        }
      } catch {
        return {
          state: 'offline',
          code: 'ERR',
        }
      } finally {
        window.clearTimeout(timeoutId)
      }
    }

    const refreshStatuses = async (showChecking = false) => {
      setIsRefreshing(true)
      if (showChecking) {
        setStatusMap((prev) => {
          const next = { ...prev }
          flattenedEndpoints.forEach((endpoint) => {
            next[endpoint.key] = { state: 'checking', code: '...' }
          })
          return next
        })
      }

      const results = await Promise.all(
        flattenedEndpoints.map(async (endpoint) => ({
          key: endpoint.key,
          status: await checkEndpoint(endpoint),
        }))
      )

      if (cancelled) return

      setStatusMap((prev) => {
        const next = { ...prev }
        results.forEach(({ key, status }) => {
          next[key] = status
        })
        return next
      })
      setIsRefreshing(false)
    }

    refreshStatusesRef.current = (showChecking = false) => refreshStatuses(showChecking)
    refreshStatuses(true)
    const timer = window.setInterval(() => refreshStatuses(false), 3600000)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [flattenedEndpoints])

  return (
    <div className="home-shell">
      <style>{`
        .home-shell {
          --bg: #050816;
          --card: rgba(8, 14, 35, 0.76);
          --line: rgba(140, 177, 255, 0.22);
          --ink: #f5f8ff;
          --muted: #a8b3d9;
          --c1: #77e9ff;
          --c2: #4f7dff;
          --c3: #5fcbff;
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          border-radius: 30px;
          border: 1px solid rgba(149, 176, 255, 0.2);
          background:
            radial-gradient(circle at 84% 2%, rgba(51, 108, 255, 0.34), transparent 24%),
            radial-gradient(circle at 10% 44%, rgba(55, 150, 255, 0.24), transparent 35%),
            linear-gradient(180deg, #040716 0%, #030513 46%, #02030f 100%);
          color: var(--ink);
          font-family: "Avenir Next", "Sora", "Trebuchet MS", sans-serif;
          isolation: isolate;
        }

        .home-noise,
        .home-wave,
        .home-glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .home-noise {
          background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 3px 3px;
          opacity: 0.08;
        }

        .home-wave::before,
        .home-wave::after {
          content: "";
          position: absolute;
          width: 62%;
          border-radius: 56% 44% 58% 42% / 48% 44% 56% 52%;
          filter: blur(1px);
          animation: float-wave 8s ease-in-out infinite;
        }

        .home-wave::before {
          height: 360px;
          right: -4%;
          bottom: 7%;
          background: linear-gradient(120deg, rgba(112, 229, 255, 0.6), rgba(31, 72, 226, 0.3));
          box-shadow: 0 0 120px rgba(80, 149, 255, 0.35);
          transform: rotate(-8deg);
        }

        .home-wave::after {
          height: 260px;
          left: 12%;
          bottom: -8%;
          opacity: 0.72;
          background: linear-gradient(120deg, rgba(106, 241, 255, 0.4), rgba(18, 56, 190, 0.25));
          box-shadow: 0 0 140px rgba(105, 173, 255, 0.28);
          animation-delay: 1.1s;
        }

        .home-glow::before {
          content: "";
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          top: -8%;
          right: -8%;
          background: radial-gradient(circle at center, rgba(107, 197, 255, 0.28), transparent 65%);
        }

        .home-wrap {
          position: relative;
          z-index: 1;
          padding: 34px 38px 42px;
        }

        .home-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 22px;
          padding: 14px 18px;
          border: 1px solid rgba(173, 197, 255, 0.2);
          border-radius: 18px;
          background: rgba(7, 11, 26, 0.66);
          backdrop-filter: blur(10px);
        }

        .home-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          letter-spacing: 0.08em;
          font-size: 14px;
          font-weight: 600;
        }

        .home-brand-dot {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(145deg, #ddf4ff, #4d96ff 70%);
          box-shadow: 0 0 34px rgba(104, 198, 255, 0.7);
        }

        .home-nav-links {
          display: flex;
          align-items: center;
          gap: 24px;
          color: #d3dcff;
          font-size: 13px;
        }

        .home-nav-links button,
        .home-btn {
          cursor: pointer;
          border: 0;
          background: transparent;
          color: inherit;
          font: inherit;
        }

        .home-pill {
          border-radius: 999px;
          padding: 9px 16px;
          font-weight: 600;
          color: #ecf9ff;
          background: linear-gradient(120deg, rgba(84, 170, 255, 0.9), rgba(80, 111, 255, 0.86));
          box-shadow: 0 10px 36px rgba(64, 98, 255, 0.4);
        }

        .home-hero {
          margin-top: 34px;
          border: 1px solid var(--line);
          border-radius: 28px;
          padding: 56px 56px 26px;
          background: linear-gradient(180deg, rgba(10, 18, 42, 0.8), rgba(5, 10, 28, 0.72));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), 0 35px 90px rgba(0,0,0,0.45);
        }

        .home-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-radius: 999px;
          font-size: 12px;
          padding: 8px 14px;
          color: #d0dcff;
          background: rgba(25, 39, 84, 0.72);
          border: 1px solid rgba(157, 184, 255, 0.3);
        }

        .home-headline {
          margin: 22px 0 0;
          max-width: 900px;
          font-size: clamp(36px, 5.6vw, 74px);
          line-height: 1.02;
          letter-spacing: -0.03em;
        }

        .home-headline em {
          font-family: "Times New Roman", Georgia, serif;
          font-style: italic;
          font-weight: 500;
          color: #b9ddff;
        }

        .home-sub {
          margin: 20px 0 0;
          max-width: 700px;
          color: var(--muted);
          line-height: 1.7;
          font-size: clamp(14px, 1.7vw, 18px);
        }

        .home-cta {
          margin-top: 28px;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .home-btn-pri,
        .home-btn-sec {
          border-radius: 999px;
          padding: 12px 20px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .home-btn-pri {
          background: linear-gradient(120deg, #e4fbff, #9dd0ff 44%, #5e86ff);
          color: #021020;
          font-weight: 700;
          box-shadow: 0 12px 30px rgba(95, 160, 255, 0.42);
        }

        .home-btn-sec {
          color: #dce8ff;
          border: 1px solid rgba(183, 204, 255, 0.36);
          background: rgba(15, 25, 53, 0.62);
        }

        .home-btn-pri:hover,
        .home-btn-sec:hover {
          transform: translateY(-2px);
        }

        .home-stat-row {
          margin-top: 34px;
          border-top: 1px solid rgba(156, 182, 255, 0.24);
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          padding-top: 18px;
        }

        .home-stat {
          border-radius: 14px;
          padding: 13px 14px;
          background: rgba(7, 14, 32, 0.6);
          border: 1px solid rgba(131, 162, 245, 0.22);
        }

        .home-stat-label {
          color: #9fb4e2;
          font-size: 12px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .home-stat-list {
          margin-top: 8px;
          display: grid;
          gap: 8px;
        }

        .home-stat-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          // border: 1px solid rgba(131, 162, 245, 0.18);
          border-radius: 9px;
          padding: 8px 10px;
          background: rgba(6, 12, 28, 0.55);
          font-size: 12px;
        }

        .home-stat-endpoint {
          color: #d8e6ff;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .home-stat-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          white-space: nowrap;
        }

        .home-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .home-dot-online {
          background: #2ed57f;
          box-shadow: 0 0 10px rgba(46, 213, 127, 0.65);
        }

        .home-dot-offline {
          background: #ff5b5b;
          box-shadow: 0 0 10px rgba(255, 91, 91, 0.45);
        }

        .home-dot-degraded {
          background: #ffb020;
          box-shadow: 0 0 10px rgba(255, 176, 32, 0.45);
        }

        .home-dot-checking {
          background: #62b8ff;
          box-shadow: 0 0 10px rgba(98, 184, 255, 0.45);
        }

        .home-trust {
          margin-top: 34px;
          border: 1px solid var(--line);
          border-radius: 18px;
          background: rgba(4, 8, 24, 0.66);
          padding: 16px 20px;
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 16px;
          align-items: center;
        }

        .home-trust-note {
          font-size: 11px;
          color: #8ca0cc;
          letter-spacing: 0.08em;
        }

        .home-trust-logos {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 8px;
        }

        .home-logo {
          text-align: center;
          font-size: 12px;
          color: #cad8ff;
          font-weight: 600;
          letter-spacing: 0.05em;
          padding: 8px 4px;
          border-radius: 10px;
          border: 1px solid rgba(139, 166, 232, 0.2);
          background: rgba(11, 18, 42, 0.6);
        }

        .home-features {
          margin-top: 34px;
        }

        .home-title {
          margin: 0;
          font-size: clamp(30px, 3.8vw, 46px);
          letter-spacing: -0.02em;
        }

        .home-title em {
          font-family: "Times New Roman", Georgia, serif;
          font-style: italic;
          font-weight: 500;
          color: #9fd4ff;
        }

        .home-feature-grid {
          margin-top: 18px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .home-feature-card {
          border-radius: 20px;
          border: 1px solid rgba(129, 164, 255, 0.28);
          background: linear-gradient(170deg, rgba(16, 27, 66, 0.8), rgba(5, 10, 27, 0.9));
          padding: 24px;
          min-height: 210px;
          transition: border-color 0.2s ease, transform 0.2s ease;
        }

        .home-feature-card:hover {
          transform: translateY(-4px);
          border-color: rgba(134, 227, 255, 0.52);
        }

        .home-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          background: linear-gradient(145deg, rgba(117, 219, 255, 0.32), rgba(92, 121, 255, 0.22));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.18);
          color: #d4eeff;
        }

        .home-process {
          margin-top: 22px;
          border-radius: 20px;
          border: 1px solid rgba(131, 161, 240, 0.22);
          padding: 20px;
          background: rgba(8, 15, 36, 0.72);
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .home-step {
          border-radius: 14px;
          padding: 14px;
          border: 1px solid rgba(148, 175, 245, 0.2);
          background: rgba(11, 20, 49, 0.58);
        }

        .home-step small {
          color: #7ca2ec;
          font-size: 11px;
          letter-spacing: 0.08em;
        }

        .home-step p {
          margin: 9px 0 0;
          color: #e3ecff;
          line-height: 1.5;
          font-size: 13px;
        }

        @keyframes float-wave {
          0%, 100% { transform: translateY(0) rotate(-8deg); }
          50% { transform: translateY(-14px) rotate(-4deg); }
        }

        @media (max-width: 1080px) {
          .home-nav-links {
            display: none;
          }

          .home-trust {
            grid-template-columns: 1fr;
          }

          .home-trust-logos {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .home-feature-grid,
          .home-process {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .home-wrap {
            padding: 18px 14px 26px;
          }

          .home-nav {
            padding: 12px;
          }

          .home-hero {
            margin-top: 16px;
            padding: 30px 18px 20px;
          }

          .home-stat-row,
          .home-feature-grid,
          .home-process,
          .home-trust-logos {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="home-noise" />
      <div className="home-glow" />
      <div className="home-wave" />

      <div className="home-wrap">
        <header className="home-nav">
          <div className="home-brand">
            <img src={PearlguardLogo} alt="Pearlguard Logo" width={46} height={'auto'} />
            {/* <span className="home-brand-dot" /> */}
            PROBE SCURUTINY
          </div>
          <nav className="home-nav-links">
            <button onClick={() => navigate('/dashboard')}>Platform</button>
            <button onClick={() => navigate('/alerts')}>Live Incidents</button>
            <button onClick={() => navigate('/about-us')}>About</button>
          </nav>
          <button className="home-pill" onClick={() => refreshStatusesRef.current(false)}>
            {isRefreshing ? 'Checking...' : 'Check Status'}
          </button>
        </header>

        <section className="home-hero">
          <div className="home-badge">
            <Sparkles size={14} />
            Security Intelligence Engine
          </div>
          <h1 className="home-headline">
            Command Your SOC
            <br />
            With <em>Autonomous Precision</em>
          </h1>
          <p className="home-sub">
            From first signal to final containment, PearlGuard orchestrates AI analysts, context,
            and response actions in one cinematic control layer.
          </p>

          <div className="home-cta">
            <button className="home-btn home-btn-pri" onClick={() => navigate('/dashboard')}>
              Enter Command Center
              <ArrowUpRight size={16} />
            </button>
            <button className="home-btn home-btn-sec" onClick={() => navigate('/alerts')}>
              Launch Live Demo
              <Orbit size={16} />
            </button>
          </div>

          <div className="home-stat-row">
            {CONNECTION_GROUPS.map((group) => (
              <article key={group.key} className="home-stat">
                <div className="home-stat-label">{group.label}</div>
                <div className="home-stat-list">
                  {group.endpoints.map((endpoint) => {
                    const current = statusMap[endpoint.key] || { state: 'checking', code: '...' }
                    const stateClass =
                      current.state === 'online'
                        ? 'home-dot-online'
                        : current.state === 'degraded'
                        ? 'home-dot-degraded'
                        : current.state === 'offline'
                        ? 'home-dot-offline'
                        : 'home-dot-checking'
                    const text =
                      current.state === 'online'
                        ? `ONLINE (${current.code})`
                        : current.state === 'degraded'
                        ? `DEGRADED (${current.code})`
                        : current.state === 'offline'
                        ? `OFFLINE (${current.code})`
                        : 'CHECKING'
                    return (
                      <div key={endpoint.key} className="home-stat-item">
                        {/* <span className="home-stat-endpoint">{endpoint.label}</span> */}
                        <span className="home-stat-status">
                          <span className={`home-dot ${stateClass}`} />
                          {text}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="home-trust">
          <div className="home-trust-note">TRUSTED IN GLOBAL SECOPS STACKS</div>
          <div className="home-trust-logos">
            {TRUSTED.map((name) => (
              <div key={name} className="home-logo">
                {name}
              </div>
            ))}
          </div>
        </section>

        <section className="home-features">
          <h2 className="home-title">
            Designed To Outrun <em>Modern Attacks</em>
          </h2>

          <div className="home-feature-grid">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <article key={title} className="home-feature-card">
                <div className="home-icon-wrap">
                  <Icon size={20} />
                </div>
                <h3 style={{ margin: '16px 0 0', fontSize: 23 }}>{title}</h3>
                <p style={{ marginTop: 12, color: '#9eb2e5', lineHeight: 1.6 }}>{desc}</p>
              </article>
            ))}
          </div>

          <div className="home-process">
            <article className="home-step">
              <small>01 / INGEST</small>
              <p>Collect logs, events, and network traces continuously.</p>
            </article>
            <article className="home-step">
              <small>02 / CORRELATE</small>
              <p>Fuse telemetry with entity context and historical behavior.</p>
            </article>
            <article className="home-step">
              <small>03 / DECIDE</small>
              <p>Score threat confidence and suggest highest-impact action.</p>
            </article>
            <article className="home-step">
              <small>04 / RESPOND</small>
              <p>Execute playbooks and notify the right team instantly.</p>
            </article>
          </div>
        </section>
      </div>
    </div>
  )
}
