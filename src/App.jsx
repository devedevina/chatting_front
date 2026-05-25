import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ChatProvider } from './context/ChatContext'
import Layout from './components/Layout/Layout'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import HomePage from './pages/HomePage'
import ChatRoomPage from './pages/ChatRoomPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminPage from './pages/AdminPage'
import ProtectedRoute from './components/Common/ProtectedRoute'
import AdminRoute from './components/Common/AdminRoute'

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ChatProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />

            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/chat/:roomId"
                element={<ProtectedRoute><ChatRoomPage /></ProtectedRoute>}
              />
              <Route
                path="/admin"
                element={<AdminRoute><AdminPage /></AdminRoute>}
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ChatProvider>
      </AuthProvider>
    </Router>
  )
}
