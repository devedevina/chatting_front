/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useCallback } from 'react'
import api from '../services/api'

const ChatContext = createContext(null)

export function ChatProvider({ children }) {
  const [chatRooms, setChatRooms] = useState([])
  const [currentRoom, setCurrentRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchChatRooms = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get('/chat-rooms')
      setChatRooms(response.data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const enterChatRoom = useCallback((roomId) => {
    setCurrentRoom(roomId)
    setMessages([])
    // TODO: WebSocket 연결
  }, [])

  const leaveChatRoom = useCallback(() => {
    setCurrentRoom(null)
    setMessages([])
    // TODO: WebSocket 연결 해제
  }, [])

  const createChatRoom = useCallback(async (roomData) => {
    setLoading(true)
    try {
      const response = await api.post('/chat-rooms', roomData)
      setChatRooms(prev => [...prev, response.data])
      setError(null)
      return response.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteRoom = useCallback(async (roomId) => {
    setLoading(true)
    try {
      await api.delete(`/chat-rooms/${roomId}`)
      setChatRooms(prev => prev.filter(r => r.id !== roomId))
      setError(null)
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const sendMessage = useCallback(async () => {
    // TODO: WebSocket을 통해 메시지 전송
  }, [])

  const addMessage = useCallback((message) => {
    setMessages(prev => [...prev, message])
  }, [])

  return (
    <ChatContext.Provider value={{
      chatRooms,
      currentRoom,
      messages,
      loading,
      error,
      fetchChatRooms,
      enterChatRoom,
      leaveChatRoom,
      createChatRoom,
      deleteRoom,
      sendMessage,
      addMessage,
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within ChatProvider')
  }
  return context
}
