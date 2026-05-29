import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useChat } from '../context/ChatContext'
import { useAuth } from '../context/AuthContext'
import ChatMessage from '../components/ChatRoom/ChatMessage'
import { onMessage, offMessage } from '../services/socket'
import '../styles/ChatRoomPage.css'

export default function ChatRoomPage() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { messages, sendMessage, enterChatRoom, leaveChatRoom, addMessage } = useChat()
  const [messageInput, setMessageInput] = useState('')
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  useEffect(() => {
    if (roomId) {
      enterChatRoom(roomId)

      const handleMessage = (messageData) => {
        console.log('Received message:', messageData)
        // 자신이 보낸 메시지는 이미 추가되었으므로 중복 제외
        if (messageData.senderNickname !== user?.nickname) {
          addMessage(messageData)
        }
      }

      onMessage(handleMessage)

      return () => {
        offMessage(handleMessage)
        leaveChatRoom()
      }
    }

    return () => {
      leaveChatRoom()
    }
  }, [roomId, enterChatRoom, leaveChatRoom, addMessage])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!messageInput.trim() || !user) return

    try {
      await sendMessage(roomId, messageInput, user.id, user.nickname)
      setMessageInput('')
    } catch (err) {
      console.error('메시지 전송 실패:', err)
    }
  }

  const handleBackClick = () => {
    setShowExitConfirm(true)
  }

  const handleConfirmExit = () => {
    leaveChatRoom()
    navigate('/')
  }

  const handleCancelExit = () => {
    setShowExitConfirm(false)
  }

  return (
    <div className="chat-room-page">
      <div className="chat-header">
        <button onClick={handleBackClick} className="btn btn-back">
          ← 뒤로가기
        </button>
        <h1 className="chat-title">채팅방</h1>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="messages-empty">아직 메시지가 없습니다.</div>
        ) : (
          messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} isOwnMessage={msg.senderNickname === user?.nickname} />
          ))
        )}
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-form">
        <div className="input-group">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="form-input"
          />
          <button type="submit" className="btn btn-primary">
            전송
          </button>
        </div>
      </form>

      {showExitConfirm && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h2>채팅방을 나가시겠습니까?</h2>
            <div className="confirm-buttons">
              <button onClick={handleConfirmExit} className="btn btn-primary">
                예
              </button>
              <button onClick={handleCancelExit} className="btn btn-secondary">
                아니오
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
