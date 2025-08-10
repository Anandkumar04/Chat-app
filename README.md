💬 Real-time Chat Application
A full-stack chat platform built with the MERN stack and Socket.io to enable instant messaging between users. It supports real-time communication, user authentication, and a sleek UI for a smooth chatting experience.

🚀 Features
🔐 User Authentication → Secure login & signup using JWT.

💬 Real-time Messaging → Powered by Socket.io for instant message delivery.

👥 Private & Group Chats → Chat with individuals or in groups.

🟢 Online Status Indicator → See who’s active in real-time.

📷 Image & File Sharing → Send multimedia along with text messages.

🌓 Dark & Light Mode → Enhanced user experience with theme switching.

🛠 Tech Stack
Frontend: React.js, Tailwind CSS
Backend: Node.js, Express.js
Database: MongoDB (Mongoose ORM)
Real-time Communication: Socket.io
Authentication: JWT (JSON Web Token)

📷 Screenshots
Login Page	Chat Room

⚙️ Installation
1️⃣ Clone the repository

bash
Copy
Edit
git clone https://github.com/yourusername/realtime-chat-app.git
cd realtime-chat-app
2️⃣ Install dependencies

bash
Copy
Edit
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
3️⃣ Setup Environment Variables
Create a .env file in backend/ with:

env
Copy
Edit
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
4️⃣ Run the application

bash
Copy
Edit
# Backend
cd backend
npm start

# Frontend
cd ../frontend
npm start
📊 How It Works
User logs in → JWT authentication verifies identity.

Joins chat room → Socket.io establishes a real-time connection.

Sends messages → Data is instantly broadcast to all participants.

Messages stored → MongoDB saves message history for future access.

📌 Future Improvements
📞 Voice & Video Calls integration using WebRTC.

📍 Location Sharing for group meetups.

🔔 Push Notifications for offline messages.

🤝 Contributing
Pull requests are welcome! Fork the repo, make your changes, and submit a PR.

📜 License
Licensed under the MIT License – free to use and modify.

