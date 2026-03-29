import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard/Dashboard'
import AlertQueue from './pages/AlertQueue/AlertQueue'
import Investigate from './pages/Investigate/Investigate'
import AgentOrchestrator from './pages/AgentOrchestrator/AgentOrchestrator'
import Incidents from './pages/Incidents/Incidents'
import Home from './pages/Home/Home'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="dashboard"   element={<Dashboard />} />
          <Route path="alerts"      element={<AlertQueue />} />
          <Route path="investigate/:alertId?" element={<Investigate />} />
          <Route path="agents"      element={<AgentOrchestrator />} />
          <Route path="incidents"   element={<Incidents />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
