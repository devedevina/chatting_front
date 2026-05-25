/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

function getInitialUser() {
  try {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function getInitialAdmin() {
  try {
    const stored = localStorage.getItem('admin')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser)
  const [admin, setAdmin] = useState(getInitialAdmin)

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    const userData = response.data
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    if (userData.token) {
      localStorage.setItem('token', userData.token)
    }
    return userData
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  const adminLogin = async (credentials) => {
    const response = await api.post('/admin/login', credentials)
    const adminData = response.data
    setAdmin(adminData)
    localStorage.setItem('admin', JSON.stringify(adminData))
    if (adminData.token) {
      localStorage.setItem('adminToken', adminData.token)
    }
    return adminData
  }

  const adminLogout = () => {
    setAdmin(null)
    localStorage.removeItem('admin')
    localStorage.removeItem('adminToken')
  }

  const signup = async (credentials) => {
    const response = await api.post('/auth/register', credentials)
    const userData = response.data
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    if (userData.token) {
      localStorage.setItem('token', userData.token)
    }
    return userData
  }

  return (
    <AuthContext.Provider value={{
      user,
      admin,
      login,
      logout,
      adminLogin,
      adminLogout,
      signup,
      isLoggedIn: !!user,
      isAdmin: !!admin,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
