import { Navigate, Outlet } from 'react-router-dom'
import { getAuthenticatedUserRole } from '../../lib/auth'

export default function RoleRoute({ allowedRoles }) {
  const role = getAuthenticatedUserRole()

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/home" replace />
  }

  return <Outlet />
}
