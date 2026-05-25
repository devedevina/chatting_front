# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**채팅 사이트 (Chatting Website)** - A real-time messaging platform built with React + Tailwind CSS frontend, connecting to a Spring Boot backend.

**Tech Stack:**
- Frontend: React 19, Vite, Tailwind CSS 4
- State Management: Context API
- Routing: React Router v7
- Real-time Communication: Socket.io client
- HTTP Client: Axios
- Styling: Tailwind CSS

**Key Features:**
- User authentication (signup, login, logout)
- Public chat rooms (viewable by non-members)
- Real-time messaging (WebSocket)
- Admin dashboard
- User warnings and sanctions
- Chat room reporting

## Quick Start Commands

```bash
# Development
npm run dev                 # Start dev server at http://localhost:5173
npm run build              # Build for production
npm run lint               # Run ESLint
npm run preview            # Preview production build

# After changes
# Just save files - HMR (Hot Module Replacement) will reload automatically
```

## Project Architecture

### Folder Structure
```
src/
├── pages/                    # Page components (routes)
│   ├── HomePage.jsx         # Chat room list (public)
│   ├── LoginPage.jsx        # User login
│   ├── SignUpPage.jsx       # User registration
│   ├── ChatRoomPage.jsx     # Chat room detail (protected)
│   ├── AdminLoginPage.jsx   # Admin login
│   └── AdminPage.jsx        # Admin dashboard (protected)
│
├── components/              # Reusable components
│   ├── Layout/
│   │   ├── Layout.jsx       # Main layout wrapper
│   │   └── Header.jsx       # Navigation header
│   ├── ChatRoom/
│   │   ├── ChatRoomList.jsx      # Display chat rooms grid
│   │   ├── ChatRoomCreate.jsx    # Create room modal
│   │   └── ChatMessage.jsx       # Individual message
│   ├── Auth/               # (Currently empty, for future use)
│   ├── Admin/              # (Currently empty, for future use)
│   └── Common/
│       ├── ProtectedRoute.jsx    # Route guard for authenticated users
│       └── AdminRoute.jsx        # Route guard for admin users
│
├── context/                 # State management
│   ├── AuthContext.jsx      # User/admin authentication state
│   └── ChatContext.jsx      # Chat room & message state
│
├── services/               # (Placeholder for future API/WebSocket logic)
│   ├── api.js             # (TODO) Axios instance with Spring Boot backend
│   └── socket.js          # (TODO) Socket.io initialization
│
├── utils/                 # Utilities
├── App.jsx               # Main router configuration
├── main.jsx              # React entry point
└── index.css             # Global styles (Tailwind + custom CSS)
```

### Data Flow Architecture

**Authentication Flow:**
1. User signs up/logs in via `LoginPage` or `SignUpPage`
2. `AuthContext.login()` or `signup()` saves user data to state + localStorage
3. Token stored in localStorage for persistence across page reloads
4. `ProtectedRoute` checks `useAuth().isLoggedIn` before allowing access
5. `AdminRoute` checks `useAuth().isAdmin` for admin pages

**Chat State Flow:**
1. `HomePage` calls `ChatContext.fetchChatRooms()` on mount
2. Displays rooms via `ChatRoomList` component
3. User clicks room → navigates to `/chat/:roomId`
4. `ChatRoomPage` calls `enterChatRoom(roomId)` via `useChat()`
5. (TODO) WebSocket connection established for real-time messages
6. Messages rendered via `ChatMessage` component

**Context Exports:**
```javascript
// AuthContext
useAuth() => {
  user,               // Current logged-in user or null
  admin,              // Current logged-in admin or null
  isLoggedIn,         // Boolean
  isAdmin,            // Boolean
  login(userData),    // Sets user + localStorage
  logout(),           // Clears user + localStorage
  signup(userData),   // Sets user + localStorage
  adminLogin(data),   // Sets admin + localStorage
  adminLogout(),      // Clears admin + localStorage
}

// ChatContext
useChat() => {
  chatRooms,          // Array of room objects
  currentRoom,        // Currently active room ID
  messages,           // Array of message objects
  loading,            // Boolean
  error,              // Error message string or null
  fetchChatRooms(),   // API call to load rooms
  enterChatRoom(id),  // Set active room + WebSocket connect
  leaveChatRoom(),    // Clear active room + WebSocket disconnect
  createChatRoom(),   // API call to create new room
  deleteRoom(id),     // API call to delete room
  sendMessage(text),  // (TODO) WebSocket emit message
  addMessage(msg),    // Add message to local state
}
```

## Routing Map

```
/                      GET  (public)  → HomePage (chat room list)
/login                 GET  (public)  → LoginPage
/signup                GET  (public)  → SignUpPage
/admin/login           GET  (public)  → AdminLoginPage
/chat/:roomId          GET  (auth)    → ChatRoomPage (ProtectedRoute)
/admin                 GET  (admin)   → AdminPage (AdminRoute)
```

## Development Guidelines

### When Adding Features

1. **New Page?** Create in `src/pages/`, add route in `App.jsx`
2. **New Component?** Create in `src/components/{category}/`
3. **State needed?** Add to existing Context or create new one
4. **API calls?** Put in Context hooks, will be moved to `src/services/api.js` later

### Backend Integration (Spring Boot)

Currently, API calls are marked as TODO. When backend is ready:

1. **Create `src/services/api.js`:**
   ```javascript
   import axios from 'axios';
   
   const api = axios.create({
     baseURL: 'http://localhost:8080/api',
     headers: {
       'Content-Type': 'application/json',
     }
   });
   
   // Add token to requests
   api.interceptors.request.use(config => {
     const token = localStorage.getItem('token');
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });
   
   export default api;
   ```

2. **Update Context files** - Replace TODO comments with actual API calls:
   ```javascript
   // Before
   // TODO: API 호출
   // const response = await api.post('/auth/signup', {...})
   
   // After
   const response = await api.post('/auth/signup', {...});
   const data = response.data;
   ```

### WebSocket Setup (Socket.io)

When implementing real-time chat:

1. **Create `src/services/socket.js`:**
   ```javascript
   import io from 'socket.io-client';
   
   let socket = null;
   
   export const connectSocket = (userId) => {
     socket = io('http://localhost:8080', {
       auth: { token: localStorage.getItem('token') }
     });
     
     socket.on('message', (msg) => {
       // Handle incoming message
     });
   };
   
   export const disconnectSocket = () => {
     socket?.disconnect();
   };
   
   export const sendMessage = (roomId, content) => {
     socket?.emit('sendMessage', { roomId, content });
   };
   ```

2. **Call in `ChatContext`:**
   ```javascript
   useEffect(() => {
     if (currentRoom) {
       connectSocket(user.id);
       return () => disconnectSocket();
     }
   }, [currentRoom, user]);
   ```

## Important Notes

### Authentication Persistence
- User/admin info persists via localStorage
- **Clearing localStorage** will log out the user
- When building for production, consider secure token storage

### Non-member Features
- **Can view:** Chat room list, room titles, member count, privacy status
- **Cannot do:** Enter rooms, send messages, create rooms, report content

### Form Validation
Currently using basic HTML5 validation. For production, consider:
- Pattern validation (username/email format)
- Backend validation (duplicate username check)
- Better error messages

### Error Handling
Most error handling is placeholder. When integrating with backend:
- Add try/catch in Context methods
- Display meaningful error messages to users
- Handle network timeouts

## Current TODO Items (Priority Order)

1. **Spring Boot Backend** - Implement all API endpoints
2. **API Integration** - Update all `// TODO: API 호출` comments
3. **WebSocket Real-time Chat** - Implement `src/services/socket.js`
4. **Form Validation** - Add comprehensive validation
5. **Error Handling** - Wrap API calls with proper error boundaries
6. **Admin Features** - Implement warning/sanction system
7. **Testing** - Add unit and integration tests
8. **Styling Polish** - Enhance UI/UX with Tailwind

## Useful Patterns

### Using Auth Context in a Component
```javascript
import { useAuth } from '../context/AuthContext';

export default function MyComponent() {
  const { user, isLoggedIn, logout } = useAuth();
  
  if (!isLoggedIn) return <p>Please log in</p>;
  
  return <div>Hello {user.nickname}</div>;
}
```

### Using Chat Context
```javascript
import { useChat } from '../context/ChatContext';

export default function MyComponent() {
  const { chatRooms, loading, error } = useChat();
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  
  return chatRooms.map(room => <div key={room.id}>{room.title}</div>);
}
```

### Protected Component
```javascript
import ProtectedRoute from '../components/Common/ProtectedRoute';

// In App.jsx route
<Route
  path="/chat/:roomId"
  element={<ProtectedRoute><ChatRoomPage /></ProtectedRoute>}
/>
```

## File Modification Notes

- **Never remove** the Context Provider wrappers in `App.jsx` (AuthProvider, ChatProvider)
- **Always preserve** route structure for authentication flow
- **Test in browser** when modifying Header or Layout components (affects all pages)
- **Check ProtectedRoute logic** if adding new authenticated pages
