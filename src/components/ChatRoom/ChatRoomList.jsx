import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import '../../styles/ChatRoomList.css'

export default function ChatRoomList({ rooms }) {
  const { user } = useAuth()

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
              <Link to={`/chat/${room.id}`} className="btn btn-primary btn-block">
                입장하기
              </Link>
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
