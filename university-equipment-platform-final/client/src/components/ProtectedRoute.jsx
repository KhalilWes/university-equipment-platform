import { Navigate } from 'react-router-dom'

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

function ProtectedRoute({ children, requiredRole = 'Admin' }) {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/" replace />
  }

  const payload = decodeJwt(token)
  const role = payload?.role

  if (role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
