/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useCallback } from 'react'
import api from '../services/api'
import { connectSocket, disconnectSocket, sendMessage as socketSendMessage } from '../services/socket'

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
    try {
      connectSocket(roomId)
    } catch (err) {
      console.error('WebSocket connection error:', err)
    }
  }, [])

  const leaveChatRoom = useCallback(() => {
    setCurrentRoom(null)
    setMessages([])
    disconnectSocket()
  }, [])

  const createChatRoom = useCallback(async (roomData) => {
    setLoading(true)
    try {
      const response = await api.post('/chat-rooms', roomData)
      const newRoom = response.data
      setChatRooms(prev => [...prev, newRoom])
      setError(null)

      try {
        connectSocket(newRoom.id)
      } catch (socketErr) {
        console.error('WebSocket connection error:', socketErr)
      }

      return newRoom
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

  const addMessage = useCallback((message) => {
    const messageWithId = {
      ...message,
      id: message.id || crypto.randomUUID(),
    }
    setMessages(prev => [...prev, messageWithId])
  }, [])

  const sendMessage = useCallback(async (roomId, content, userId, senderNickname) => {
    try {
      const messageData = {
        content,
        userId,
        senderNickname,
        timestamp: new Date().toISOString(),
      }

      addMessage(messageData)
      socketSendMessage(roomId, messageData)

      return messageData
    } catch (err) {
      console.error('Send message error:', err)
      setError(err.message)
      throw err
    }
  }, [addMessage])

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
