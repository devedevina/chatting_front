import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import '../../styles/ProtectedRoute.css'

export default function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth()

  if (loading) {
    return <div className="loading-container">로딩 중...</div>
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return children
}
