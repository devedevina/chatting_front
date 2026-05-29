import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8080'

let stompClient = null
let messageCallbacks = []

export const connectSocket = (roomId) => {
  try {
    if (!roomId) {
      console.error('WebSocket: roomId is required')
      return null
    }

    if (stompClient?.connected) {
      disconnectSocket()
    }

    const token = localStorage.getItem('token')
    const socketUrl = `${SOCKET_URL}/ws-chats`

    console.log('WebSocket: Creating connection to', socketUrl)
    
    stompClient = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      connectHeaders: {
        'Authorization': `Bearer ${token}`,
      },
      onConnect: () => {
        console.log('WebSocket: Connected successfully')

        const topic = `/topic/chat/${roomId}`
        console.log('WebSocket: Subscribing to', topic)

        stompClient.subscribe(topic, (message) => {
          console.log('WebSocket: Message received:', message.body)
          const data = JSON.parse(message.body)
          messageCallbacks.forEach(callback => callback(data))
        })

        console.log('WebSocket: Subscribed to', topic)
      },
      onDisconnect: () => {
        console.log('WebSocket: Disconnected')
      },
      onStompError: (frame) => {
        console.error('WebSocket: STOMP error:', frame.body)
      },
      onWebSocketError: (error) => {
        console.error('WebSocket: Connection error:', error)
      },
    })

    stompClient.activate()

    return stompClient
  } catch (err) {
    console.error('WebSocket: Exception in connectSocket:', err.message || err)
    return null
  }
}

export const disconnectSocket = () => {
  if (stompClient?.connected) {
    stompClient.deactivate()
    console.log('WebSocket: Disconnected')
    stompClient = null
  }
}

export const sendMessage = (roomId, message) => {
  if (stompClient?.connected) {
    const destination = `/app/chat/${roomId}/send`
    stompClient.publish({
      destination,
      body: JSON.stringify(message),
    })
    console.log('WebSocket: Message sent to', destination)
  } else {
    console.error('WebSocket: Not connected')
  }
}

export const onMessage = (callback) => {
  messageCallbacks.push(callback)
}

export const offMessage = (callback) => {
  messageCallbacks = messageCallbacks.filter(cb => cb !== callback)
}

export const getSocket = () => stompClient
