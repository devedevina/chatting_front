import { useState } from 'react'
import '../styles/AdminPage.css'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('chatrooms')

  return (
    <div className="admin-page">
      <h1 className="admin-title">관리자 대시보드</h1>

      <div className="admin-tabs">
        <button
          onClick={() => setActiveTab('chatrooms')}
          className={`tab-btn ${activeTab === 'chatrooms' ? 'active' : ''}`}
        >
          채팅방 관리
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
        >
          신고 관리
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
        >
          사용자 관리
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'chatrooms' && (
          <div>
            <h2 className="content-title">채팅방 관리</h2>
            <div className="content-placeholder">
              채팅방 관리 기능이 곧 추가될 예정입니다.
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <h2 className="content-title">신고 관리</h2>
            <div className="content-placeholder">
              신고 관리 기능이 곧 추가될 예정입니다.
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2 className="content-title">사용자 관리</h2>
            <div className="content-placeholder">
              사용자 관리 기능이 곧 추가될 예정입니다.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
