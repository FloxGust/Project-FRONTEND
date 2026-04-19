import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  const cards = [
    { title: "Real-time Detection", value: "Live", desc: "Monitoring threats continuously" },
    { title: "AI Confidence", value: "99.1%", desc: "Model prediction accuracy" },
    { title: "Incidents", value: "128", desc: "Handled this week" },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #0206171e, #020b1f2a, #0206171e)', color: 'white', borderRadius: '30px', border: '1px solid #1f2937', padding: '40px', position: 'relative' }}>
      {/* glow background */}
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-5rem', left: '25%', height: '400px', width: '400px', borderRadius: '9999px', backgroundColor: 'rgba(6, 182, 212, 0.3)', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', bottom: 0, right: '25%', height: '400px', width: '400px', borderRadius: '9999px', backgroundColor: 'rgba(59, 130, 246, 0.1)', filter: 'blur(120px)' }} />
      </div>

      {/* navbar */}
      <header style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ height: '40px', width: '40px', borderRadius: '9999px', background: 'linear-gradient(to bottom right, white, #67e8f9)', boxShadow: '0 0 40px rgba(56,189,248,0.6)' }} />
          <span style={{ fontSize: '1.125rem', fontWeight: 600, letterSpacing: '0.025em' }}>PearlGuard</span>
        </div>

        <div style={{ display: 'flex', gap: '32px', fontSize: '0.875rem', color: 'rgba(207, 250, 254, 0.7)' }}>
          <span onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>Solutions</span>
          <span onClick={() => navigate('/alerts')} style={{ cursor: 'pointer' }}>Dashbord</span>
          <span onClick={() => navigate('/about-us')} style={{ cursor: 'pointer' }}>About Us</span>
        </div>

        <button onClick={() => navigate('/dashboard')} style={{ borderRadius: '9999px', background: 'linear-gradient(to right, #67e8f9, #3b82f6)', padding: '8px 20px', color: 'black', fontWeight: 500, border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', cursor: 'pointer' }}>
          Get Started
        </button>
      </header>

      {/* hero */}
      <section style={{ position: 'relative', zIndex: 10, padding: '80px 40px 64px 40px' }}>
        <h1 style={{ fontSize: '3.75rem', fontWeight: 600, lineHeight: 1.25, maxWidth: '56rem', margin: 0 }}>
          Cybersecurity
          <span style={{ display: 'block', background: 'linear-gradient(to right, white, #a5f3fc, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>
            powered by AI intelligence
          </span>
        </h1>

        <p style={{ marginTop: '24px', color: '#cbd5e1', maxWidth: '42rem' }}>
          ____________________________________________
        </p>

        <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '12px 24px', borderRadius: '9999px', backgroundColor: '#67e8f9', color: 'black', fontWeight: 500, border: 'none', boxShadow: '0 0 40px rgba(56,189,248,0.5)', cursor: 'pointer' }}>
            Explore
          </button>
          <button onClick={() => navigate('/alerts')} style={{ padding: '12px 24px', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.2)', color: 'white', backgroundColor: 'transparent', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', cursor: 'pointer' }}>
            Live Demo
          </button>
        </div>
      </section>

      {/* dashboard preview */}
      <section style={{ position: 'relative', zIndex: 10, padding: '0 40px 80px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '24px' }}>
          {cards.map((c) => (
            <div
              key={c.title}
              style={{ borderRadius: '24px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '24px', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
            >
              <div style={{ fontSize: '0.875rem', color: 'rgba(165, 243, 252, 0.7)' }}>{c.title}</div>
              <div style={{ fontSize: '1.875rem', fontWeight: 600, margin: '8px 0' }}>{c.value}</div>
              <div style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>{c.desc}</div>
            </div>
          ))}
        </div>

        {/* center pearl visual */}
        <div style={{ marginTop: '64px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ position: 'relative', height: '16rem', width: '16rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, borderRadius: '9999px', border: '1px solid rgba(103, 232, 249, 0.2)' }} />
            <div style={{ height: '10rem', width: '10rem', borderRadius: '9999px', background: 'linear-gradient(to bottom right, white, #cffafe, #60a5fa)', boxShadow: '0 0 100px rgba(125,211,252,0.8)' }} />
          </div>
        </div>
      </section>

      {/* feature */}
      <section style={{ padding: '0 40px 96px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '24px' }}>
          <div style={{ padding: '24px', borderRadius: '24px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Threat Analysis</h3>
            <p style={{ marginTop: '12px', color: '#94a3b8', margin: '12px 0 0 0' }}>Analyze logs and detect anomalies instantly</p>
          </div>

          <div style={{ padding: '24px', borderRadius: '24px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>AI Context Engine</h3>
            <p style={{ marginTop: '12px', color: '#94a3b8', margin: '12px 0 0 0' }}>Understand attack patterns with AI context</p>
          </div>

          <div style={{ padding: '24px', borderRadius: '24px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Automated Response</h3>
            <p style={{ marginTop: '12px', color: '#94a3b8', margin: '12px 0 0 0' }}>Reduce manual SOC workload with automation</p>
          </div>
        </div>
      </section>
    </div>
  );
}