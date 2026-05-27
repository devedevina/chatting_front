import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChat } from '../../context/ChatContext'
import '../../styles/ChatRoomCreate.css'

export default function ChatRoomCreate({ onClose, onCreated }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPublic: false,
    requiresPassword: false,
    password: '',
    maxMembers: 50,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { createChatRoom } = useChat()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.title.trim()) {
        throw new Error('채팅방 제목을 입력해주세요.')
      }

      if (formData.requiresPassword && !formData.password.trim()) {
        throw new Error('비밀번호를 입력해주세요.')
      }

      const submitData = {
        title: formData.title,
        description: formData.description,
        isPublic: formData.isPublic,
        maxMembers: formData.maxMembers,
      }

      if (formData.requiresPassword) {
        submitData.password = formData.password
      }

      console.log('Submitting room data:', submitData)
      const createdRoom = await createChatRoom(submitData)
      onCreated()
      navigate(`/chat/${createdRoom.id}`)
    } catch (err) {
      console.error('Room creation error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">새 채팅방 만들기</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">채팅방 제목 *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">채팅방 설명</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">최대 인원 수</label>
            <input
              type="number"
              name="maxMembers"
              min="2"
              max="1000"
              value={formData.maxMembers}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
              />
              <span>비공개 채팅방</span>
            </label>
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="requiresPassword"
                checked={formData.requiresPassword}
                onChange={handleChange}
              />
              <span>비밀번호 설정</span>
            </label>
          </div>

          {formData.requiresPassword && (
            <div className="form-group">
              <label className="form-label">비밀번호</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          )}

          <div className="modal-buttons">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? '생성 중...' : '채팅방 생성'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
