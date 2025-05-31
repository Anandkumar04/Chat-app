const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');      // Your auth routes (not shown here)
const messageRoutes = require('./routes/messages'); // Your message routes (not shown here)
const Message = require('./models/Message');      // Your mongoose message model (not shown here)

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "https://chat-app-phi-five-89.vercel.app/",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chatapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('typing', ({ room, username }) => {
    socket.to(room).emit('typing', { username });
  });

  socket.on('stop-typing', ({ room, username }) => {
    socket.to(room).emit('stop-typing', { username });
  });

  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  socket.on('send-message', async (data) => {
    try {
      const message = new Message({
        text: data.text,
        sender: data.sender,
        room: data.room,
        timestamp: new Date()
      });
      
      await message.save();
      await message.populate('sender', 'username');
      
      io.to(data.room).emit('receive-message', message);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
