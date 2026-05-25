import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import ChatRoomList from '../components/ChatRoom/ChatRoomList'
import ChatRoomCreate from '../components/ChatRoom/ChatRoomCreate'
import '../styles/HomePage.css'

export default function HomePage() {
  const { user } = useAuth()
  const { chatRooms, fetchChatRooms, loading } = useChat()
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchChatRooms()
  }, [fetchChatRooms])

  return (
    <div className="home-page">
      <div className="home-header">
        <h1 className="home-title">채팅방 목록</h1>
        {user && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-success"
          >
            새 채팅방 만들기
          </button>
        )}
      </div>

      {loading && <div className="loading-text">로딩 중...</div>}

      {!loading && chatRooms.length === 0 && (
        <div className="empty-message">
          {user
            ? '채팅방이 없습니다. 새로운 채팅방을 만들어보세요!'
            : '채팅방이 없습니다. 로그인 후 채팅방에 입장할 수 있습니다.'}
        </div>
      )}

      <ChatRoomList rooms={chatRooms} />

      {showCreateModal && user && (
        <ChatRoomCreate
          onClose={() => setShowCreateModal(false)}
          onCreated={() => setShowCreateModal(false)}
        />
      )}
    </div>
  )
}
