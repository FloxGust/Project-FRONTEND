import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import RoleRoute from './components/auth/RoleRoute'
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
import UserDashboard from './pages/User/UserDashboard'
import UserAlertQueue from './pages/User/UserAlertQueue'
import UserInvestigateDetail from './pages/User/UserInvestigateDetail'
import UserInvestigateContext from './pages/User/UserInvestigateContext'
import UserInvestigateSummary from './pages/User/UserInvestigateSummary'
import { getAuthenticatedUserRole } from './lib/auth'

function RolePage({ admin, user }) {
  return getAuthenticatedUserRole() === 'user' ? user : admin
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="dashboard" element={<RolePage admin={<Dashboard />} user={<UserDashboard />} />} />
            <Route path="alerts" element={<RolePage admin={<AlertQueue />} user={<UserAlertQueue />} />} />
            <Route path="investigate" element={<RolePage admin={<InvestigateDetail />} user={<UserInvestigateDetail />} />} />
            <Route path="investigate/context" element={<RolePage admin={<InvestigateContext />} user={<UserInvestigateContext />} />} />
            <Route path="investigate/summary" element={<RolePage admin={<InvestigateSummary />} user={<UserInvestigateSummary />} />} />
            <Route path="investigate/:alertId" element={<RolePage admin={<InvestigateDetail />} user={<UserInvestigateDetail />} />} />
            <Route path="investigate/:alertId/context" element={<RolePage admin={<InvestigateContext />} user={<UserInvestigateContext />} />} />
            <Route path="investigate/:alertId/summary" element={<RolePage admin={<InvestigateSummary />} user={<UserInvestigateSummary />} />} />
            <Route path="agents" element={<AgentOrchestrator />} />
            <Route path="incidents" element={<Incidents />} />
            <Route element={<RoleRoute allowedRoles={['admin']} />}>
              <Route path="sedr" element={<SendEdr />} />
            </Route>
            <Route path="about-us" element={<AboutUs />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
