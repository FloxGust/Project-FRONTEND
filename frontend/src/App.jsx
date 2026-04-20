import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Dashboard from './pages/Dashboard/Dashboard'
import AlertQueue from './pages/AlertQueue/AlertQueue'
import InvestigateDetail from './pages/Investigate/investigate-detail'
import InvestigateContext from './pages/Investigate/investigate-context'
import InvestigateSummary from './pages/Investigate/investigate-summary'
import AgentOrchestrator from './pages/AgentOrchestrator/AgentOrchestrator'
import Incidents from './pages/Incidents/Incidents'
import Home from './pages/Home/Home'
import AboutUs from './pages/AboutUs/AboutUs'
import SendEdr from './pages/SEDR/sendedr'
import Login from './pages/Login/Login'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="alerts" element={<AlertQueue />} />
            <Route path="investigate" element={<InvestigateDetail />} />
            <Route path="investigate/context" element={<InvestigateContext />} />
            <Route path="investigate/summary" element={<InvestigateSummary />} />
            <Route path="investigate/:alertId" element={<InvestigateDetail />} />
            <Route path="investigate/:alertId/context" element={<InvestigateContext />} />
            <Route path="investigate/:alertId/summary" element={<InvestigateSummary />} />
            <Route path="agents" element={<AgentOrchestrator />} />
            <Route path="incidents" element={<Incidents />} />
            <Route path="sedr" element={<SendEdr />} />
            <Route path="about-us" element={<AboutUs />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
