import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import '../../styles/Header.css'

export default function Header() {
  const { user, admin, logout, adminLogout } = useAuth()

  return (
    <header className="header">
      <nav className="header-nav">
        <Link to="/" className="header-title">
          채팅 사이트
        </Link>

        <div className="header-actions">
          {user ? (
            <>
              <span className="header-user-info">
                {user.nickname} ({user.username})
              </span>
              <button onClick={logout} className="btn btn-logout">
                로그아웃
              </button>
            </>
          ) : admin ? (
            <>
              <span className="header-user-info">관리자 모드</span>
              <button onClick={adminLogout} className="btn btn-logout">
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary">
                로그인
              </Link>
              <Link to="/signup" className="btn btn-success">
                회원가입
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
