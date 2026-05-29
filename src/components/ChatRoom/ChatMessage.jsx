import '../../styles/ChatMessage.css'

export default function ChatMessage({ message, isOwnMessage }) {
  const isSystemMessage = message.type === 'SYSTEM'

  if (isSystemMessage) {
    return <div className="system-message">{message.content}</div>
  }

  return (
    <div className={`message-wrapper ${isOwnMessage ? 'own-message-wrapper' : 'other-message-wrapper'}`}>
      {!isOwnMessage && message.senderNickname && (
        <div className="message-nickname-label">{message.senderNickname}</div>
      )}
      <div className={`user-message ${isOwnMessage ? 'message-own' : 'message-other'}`}>
        <div className="message-header">
          <span className="message-time">
            {new Date(message.timestamp).toLocaleTimeString('ko-KR')}
          </span>
        </div>
        <p className="message-content">{message.content}</p>
      </div>
    </div>
  )
}
