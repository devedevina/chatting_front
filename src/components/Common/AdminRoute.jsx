import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import '../../styles/ProtectedRoute.css'

export default function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth()

  if (loading) {
    return <div className="loading-container">로딩 중...</div>
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}
