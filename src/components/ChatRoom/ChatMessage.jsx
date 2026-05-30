import '../../styles/ChatMessage.css'

export default function ChatMessage({ message, isOwnMessage }) {
  const isSystemMessage = message.type === 'SYSTEM'

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const hours = date.getHours()
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const period = hours >= 12 ? '오후' : '오전'
    const displayHours = String(hours % 12 || 12).padStart(2, '0')
    return `${period} ${displayHours}:${minutes}`
  }

  if (isSystemMessage) {
    return <div className="system-message">{message.content}</div>
  }

  return (
    <div className={`message-wrapper ${isOwnMessage ? 'own-message-wrapper' : 'other-message-wrapper'}`}>
      {!isOwnMessage && message.senderNickname && (
        <div className="message-nickname-label">{message.senderNickname}</div>
      )}
      <div className={`user-message ${isOwnMessage ? 'message-own' : 'message-other'}`}>
        <p className="message-content">{message.content}</p>
        <span className="message-time">{formatTime(message.timestamp)}</span>
      </div>
    </div>
  )
}
