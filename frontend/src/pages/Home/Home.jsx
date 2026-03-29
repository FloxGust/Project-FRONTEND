import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  const cards = [
    { title: "Real-time Detection", value: "Live", desc: "Monitoring threats continuously" },
    { title: "AI Confidence", value: "99.1%", desc: "Model prediction accuracy" },
    { title: "Incidents", value: "128", desc: "Handled this week" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#020b1f] to-[#020617] text-white" style={{ borderRadius: '30px',border: '1px solid #1f2937', padding: '40px' }}>
      {/* glow background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 left-1/4 h-[400px] w-[400px] rounded-full bg-cyan-500/30 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      {/* navbar */}
      <header className="relative z-10 flex items-center justify-between px-10 py-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-white to-cyan-300 shadow-[0_0_40px_rgba(56,189,248,0.6)]" />
          <span className="text-lg font-semibold tracking-wide">PearlGuard</span>
        </div>

        <div className="flex gap-8 text-sm text-cyan-100/70">
          <span onClick={() => navigate('/dashboard')} className="hover:text-white cursor-pointer">Solutions</span>
          <span onClick={() => navigate('/alerts')} className="hover:text-white cursor-pointer">Dashbord</span>
          <span onClick={() => navigate('/about-us')} className="hover:text-white cursor-pointer">About Us</span>
        </div>

        <button onClick={() => navigate('/dashboard')} className="rounded-full bg-gradient-to-r from-cyan-300 to-blue-500 px-5 py-2 text-black font-medium shadow-lg">
          Get Started
        </button>
      </header>

      {/* hero */}
      <section className="relative z-10 px-10 pt-20 pb-16">
        <h1 className="text-6xl font-semibold leading-tight max-w-4xl">
          Cybersecurity
          <span className="block bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
            powered by AI intelligence
          </span>
        </h1>

        <p className="mt-6 text-slate-300 max-w-2xl">
          ____________________________________________
        </p>

        <div className="mt-8 flex gap-4">
          <button onClick={() => navigate('/dashboard')} className="px-6 py-3 rounded-full bg-cyan-300 text-black font-medium shadow-[0_0_40px_rgba(56,189,248,0.5)]">
            Explore
          </button>
          <button onClick={() => navigate('/alerts')} className="px-6 py-3 rounded-full border border-white/20 text-white backdrop-blur">
            Live Demo
          </button>
        </div>
      </section>

      {/* dashboard preview */}
      <section className="relative z-10 px-10 pb-20">
        <div className="grid grid-cols-3 gap-6">
          {cards.map((c) => (
            <div
              key={c.title}
              className="rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl shadow-xl"
            >
              <div className="text-sm text-cyan-200/70">{c.title}</div>
              <div className="text-3xl font-semibold mt-2">{c.value}</div>
              <div className="text-sm text-slate-400 mt-2">{c.desc}</div>
            </div>
          ))}
        </div>

        {/* center pearl visual */}
        <div className="mt-16 flex justify-center">
          <div className="relative h-64 w-64 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-cyan-300/20 animate-pulse" />
            <div className="h-40 w-40 rounded-full bg-gradient-to-br from-white via-cyan-100 to-blue-400 shadow-[0_0_100px_rgba(125,211,252,0.8)]" />
          </div>
        </div>
      </section>

      {/* feature */}
      <section className="px-10 pb-24">
        <div className="grid grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur">
            <h3 className="text-xl font-semibold">Threat Analysis</h3>
            <p className="mt-3 text-slate-400">Analyze logs and detect anomalies instantly</p>
          </div>

          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur">
            <h3 className="text-xl font-semibold">AI Context Engine</h3>
            <p className="mt-3 text-slate-400">Understand attack patterns with AI context</p>
          </div>

          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur">
            <h3 className="text-xl font-semibold">Automated Response</h3>
            <p className="mt-3 text-slate-400">Reduce manual SOC workload with automation</p>
          </div>
        </div>
      </section>
    </div>
  );
}