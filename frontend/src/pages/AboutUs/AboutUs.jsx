import { useNavigate } from "react-router-dom";

export default function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#020b1f] to-[#020617] text-white">
      {/* glow background */}
      <div className="absolute inset-0 overflow-hidden" style={{ zIndex: -1 }}>
        <div className="absolute -top-20 left-1/4 h-[400px] w-[400px] rounded-full bg-cyan-400/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      {/* navbar */}
      <header className="relative z-10 flex items-center justify-between px-10 py-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-white to-cyan-300 shadow-[0_0_40px_rgba(56,189,248,0.6)]" />
          <span className="text-lg font-semibold tracking-wide">
            PearlGuard
          </span>
        </div>

        <div className="flex gap-8 text-sm text-cyan-100/70">
          <span
            onClick={() => navigate("/dashboard")}
            className="hover:text-white cursor-pointer"
          >
            Solutions
          </span>
          <span
            onClick={() => navigate("/alerts")}
            className="hover:text-white cursor-pointer"
          >
            Dashbord
          </span>
          <span
            onClick={() => navigate("/about-us")}
            className="hover:text-white cursor-pointer"
          >
            About Us
          </span>
        </div>

        {/* <button
          onClick={() => navigate("/dashboard")}
          className="rounded-full bg-gradient-to-r from-cyan-300 to-blue-500 px-5 py-2 text-black font-medium shadow-lg"
        >
          Get Started
        </button> */}
      </header>

      {/* hero */}
      <section className="relative z-10 px-10 pt-20 pb-16">
        <h1 className="text-6xl font-semibold leading-tight max-w-4xl">
          Members
          <span className="block bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
            Develop by Team Pearl
          </span>
        </h1>

        <div className="mt-8 flex gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 rounded-full bg-cyan-300 text-black font-medium shadow-[0_0_40px_rgba(56,189,248,0.5)]"
          >
            Contact Us
          </button>
          <button
            onClick={() => navigate("/alerts")}
            className="px-6 py-3 rounded-full border border-white/20 text-white backdrop-blur"
          >
            Find
          </button>
        </div>
      </section>
      <section className="relative z-10 px-10 pt-20 pb-16">
        <p className="text-4xl from-white max-w-2xl">Natasha Lertsansiri</p>
      </section>
    </div>
  );
}
