import '../../styles/ChatMessage.css'

export default function ChatMessage({ message }) {
  const isSystemMessage = message.type === 'SYSTEM'

  if (isSystemMessage) {
    return <div className="system-message">{message.content}</div>
  }

  return (
    <div className="user-message">
      <div className="message-header">
        <span className="message-nickname">{message.nickname}</span>
        <span className="message-time">
          {new Date(message.timestamp).toLocaleTimeString('ko-KR')}
        </span>
      </div>
      <p className="message-content">{message.content}</p>
    </div>
  )
}
