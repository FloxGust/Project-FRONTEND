import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { authenticate, isAuthenticated, loginSession } from '../../lib/auth'
import wavesVideo from '../../assets/video/White Waves - Background.mp4'
import PearlguardLogo from '../../assets/image/PearlguardLogo.png'
import Pearlguard from '../../assets/image/Pearlguard.png'
import Probe from '../../assets/image/Probe.png'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [hover, setHover] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/home'

  if (isAuthenticated()) {
    return <Navigate to={from} replace />
  }

  const handleLogin = (event) => {
    event.preventDefault()
    const foundUser = authenticate(username, password)

    if (!foundUser) {
      setError('Invalid username or password')
      return
    }

    loginSession(foundUser.username)
    navigate(from, { replace: true })
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'Grid',
        // justifyContent: 'start',
        // alignItems: 'center',
        // placeItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: 24,
        fontFamily: 'exo, sans-serif',
      }}
    >
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: -1,
        }}
      >
        <source src={wavesVideo} type="video/mp4" />
      </video>
      <div
        style={{
          gridColumn: 1,
          gridRow: 1,
          marginTop: '-10%',
          marginLeft: '6%',
          color: '#ffffff',
          display: 'flex',            // 👈 เปลี่ยนตรงนี้
          alignItems: 'center',       // จัดแนวตั้งให้ตรงกัน
          gap: '0px',                // ระยะห่างระหว่าง img กับ text
          zIndex: 100,
        }}
      >
        <img
          src={PearlguardLogo}
          alt="Pearlguard Logo"
          style={{width: 420, height: 'auto', marginRight: -100 }}
        />
        <img
          src={Probe}
          alt="Probe"
          style={{width: 720, height: 'auto', marginRight: -200,marginLeft: 60 }}
        />
        {/* <img
          src={Pearlguard}
          alt="Pearlguard"
          style={{width: 720, height: 'auto', marginRight: -200 }}
        /> */}
        {/* <div>
          <p style={{ fontSize: '1.5rem',fontFamily: "Damion", color: 'rgba(235, 239, 255, 0.72)' }}>
            Welcome To
          </p>
          <h1
            style={{
              color: '#fff1e6',
              fontSize: '7.5rem',
              fontFamily: "Damion",
              fontWeight: 900,
              fontStyle: "normal",
              letterSpacing: '10px',
            }}
          >
            Pearl Guard
          </h1>
          <h2 style={{fontFamily: "Damion",wordSpacing: '5px' }}>
            The Cyber-Security Agentic AI
          </h2>
        </div> */}
      </div>
      {/* Overlay Gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          // background: 'linear-gradient(180deg, rgba(6, 10, 26, 0.1) 0%, rgba(1, 1, 1, 0.62) 100%)',
          zIndex: 0,
        }}
      />

      {/* Form */}
      <form
        onSubmit={handleLogin}
        style={{
          gridColumn: 3,
          gridRow: 1,
          width: '100%',
          maxWidth: 400,
          maxHeight: 500,
          border: '1px solid rgba(224, 231, 255, 0.2)',
          background: 'rgba(1, 2, 10, 0.1)',
          borderRadius: 26,
          padding: 40,
          boxShadow: '0 30px 60px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          left: '15%',
          top: '15%',
          zIndex: 1,
          fontSize: 18,
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: 8, fontSize: 30, color: '#ffffff', textAlign: 'center', margin: '0 4px 0 0' }}>Sign in</h1>
        {/* <p style={{ marginTop: 0, marginBottom: 20, color: 'rgba(235, 239, 255, 0.72)' }}>
          Sign in to continue
        </p> */}
        <div style={{ height: 30 }}></div>
        <label htmlFor="username" style={{ display: 'block', marginBottom: 6 }}>
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          style={{
            width: '100%',
            marginBottom: 14,
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid rgba(224, 231, 255, 0.3)',
            background: 'rgba(255,255,255,0.05)',
            color: '#ffffff',
          }}
          autoComplete="username"
        />

        <label htmlFor="password" style={{ display: 'block', marginBottom: 6 }}>
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          style={{
            width: '100%',
            marginBottom: 14,
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid rgba(224, 231, 255, 0.3)',
            background: 'rgba(255,255,255,0.05)',
            color: '#ffffff',
          }}
          autoComplete="current-password"
        />

        <button
          type="submit"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            width: '100%',
            marginTop: 40,
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid rgba(224, 231, 255, 0.28)',
            background: hover
              ? 'linear-gradient(100deg, rgba(12, 1, 1, 0.3), rgba(10, 5, 9, 0.4))'
              : 'linear-gradient(100deg, rgba(12, 1, 1, 0.1), rgba(10, 5, 9, 0.1))',
            color: '#ffffff',
            cursor: 'pointer',
          }}
        >
          Login
        </button>

        {error && <p style={{ color: '#ff8f9f', marginTop: 14, marginBottom: 0 }}>{error}</p>}
      </form>


    </div>
  )
}
