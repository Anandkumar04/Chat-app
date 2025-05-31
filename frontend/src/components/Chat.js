import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../context/Authcontext';

const SOCKET_URL = 'https://chat-app-backend-gz6q.onrender.com';

const Chat = () => {
  const { user, logout } = useAuth();

  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentRoom, setCurrentRoom] = useState('general');
  const [typingUsers, setTypingUsers] = useState([]);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize socket connection once
  useEffect(() => {
    const newSocket = io(SOCKET_URL, { autoConnect: false });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Join room, setup listeners and load messages on currentRoom change
  useEffect(() => {
    if (!socket) return;

    // Join new room
    socket.emit('join-room', currentRoom);

    // Load messages for the room
    loadMessages();

    // Listen for new messages
    socket.on('receive-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for typing users update
    socket.on('user-typing', (typingUsers) => {
      setTypingUsers(typingUsers.filter(u => u !== user.username));
    });

    // Cleanup listeners on room change or component unmount
    return () => {
      socket.emit('leave-room', currentRoom);
      socket.off('receive-message');
      socket.off('user-typing');
    };
  }, [currentRoom, socket]);

  // Connect socket when ready
  useEffect(() => {
    if (socket && !socket.connected) {
      socket.connect();
    }
  }, [socket]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages from backend API
  const loadMessages = async () => {
    try {
      const response = await axios.get(`${SOCKET_URL}/api/messages/${currentRoom}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Send message handler
  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const messageData = {
      text: newMessage,
      sender: user.id,
      username: user.username,
      room: currentRoom,
      timestamp: Date.now(),
    };

    socket.emit('send-message', messageData);

    // Optimistic update so user sees message immediately
    setMessages(prev => [...prev, messageData]);
    setNewMessage('');

    // Notify server user stopped typing when message sent
    socket.emit('typing', { room: currentRoom, username: user.username, typing: false });
  };

  // Handle user typing event
  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!socket) return;

    socket.emit('typing', { room: currentRoom, username: user.username, typing: true });

    // Clear previous timeout if any
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // After 2 seconds of no typing, send typing=false
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { room: currentRoom, username: user.username, typing: false });
    }, 2000);
  };

  // Format timestamp nicely
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      {/* Sidebar */}
      <div style={{
        width: '250px',
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '1rem',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div>
          <h3>Chat Rooms</h3>
          {['general', 'random'].map(room => (
            <div
              key={room}
              onClick={() => setCurrentRoom(room)}
              style={{
                padding: '0.5rem',
                backgroundColor: currentRoom === room ? '#3498db' : 'transparent',
                cursor: 'pointer',
                borderRadius: '4px',
                marginBottom: '0.5rem',
                userSelect: 'none'
              }}
            >
              {`: ) ${room}`}
            </div>
          ))}
        </div>

        <div>
          <p>Welcome, <strong>{user.username}</strong>!</p>
          <button
            onClick={logout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{
          padding: '1rem',
          backgroundColor: '#ecf0f1',
          borderBottom: '1px solid #bdc3c7'
        }}>
          <h2>😉 {currentRoom}</h2>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
          backgroundColor: '#f4f6f7'
        }}>
          {messages.map((message, index) => {
            const isCurrentUser =
              message.sender === user.id ||
              message.sender?._id === user.id ||
              message.sender === user._id;

            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                  marginBottom: '1rem'
                }}
              >
                <div style={{
                  maxWidth: '60%',
                  backgroundColor: isCurrentUser ? '#3498db' : '#ecf0f1',
                  color: isCurrentUser ? 'white' : 'black',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  textAlign: 'left',
                  wordBreak: 'break-word'
                }}>
                  <div style={{
                    marginBottom: '0.25rem',
                    fontSize: '0.85rem',
                    fontWeight: 'bold'
                  }}>
                    {message.username || message.sender?.username || 'Unknown'}
                  </div>
                  <div>{message.text}</div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: isCurrentUser ? '#dfe6e9' : '#7f8c8d',
                    marginTop: '0.3rem'
                  }}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div style={{ padding: '0 1rem', fontStyle: 'italic', color: '#7f8c8d' }}>
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={sendMessage} style={{ padding: '1rem', backgroundColor: '#ecf0f1' }}>
          <div style={{ display: 'flex' }}>
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              placeholder={`Message ${currentRoom}...`}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid #bdc3c7',
                borderRadius: '4px 0 0 4px',
                fontSize: '1rem'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '0 4px 4px 0',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;
