import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useChat } from '../../context/ChatContext'
import '../../styles/ChatRoomList.css'

export default function ChatRoomList({ rooms }) {
  const { user } = useAuth()
  const { joinChatRoom, loading } = useChat()
  const navigate = useNavigate()

  const handleJoinRoom = async (roomId) => {
    try {
      await joinChatRoom(roomId)
      navigate(`/chat/${roomId}`)
    } catch (err) {
      console.error('Failed to join room:', err)
    }
  }

  return (
    <div className="room-grid">
      {rooms.map((room) => (
        <div key={room.id} className="room-card">
          <div className="room-card-content">
            <h2 className="room-title">{room.title}</h2>
            <p className="room-description">{room.description}</p>

            <div className="room-info">
              <div>👥 인원: {room.currentMembers}/{room.maxMembers}</div>
              <div>
                🔐 {room.isPublic ? '공개' : '비공개'}
                {room.requiresPassword && ' (비밀번호 필요)'}
              </div>
            </div>

            {user ? (
              <button
                onClick={() => handleJoinRoom(room.id)}
                disabled={loading}
                className="btn btn-primary btn-block"
              >
                {loading ? '입장 중...' : '입장하기'}
              </button>
            ) : (
              <button disabled className="btn btn-disabled btn-block">
                로그인 후 입장 가능
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
