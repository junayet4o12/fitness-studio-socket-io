const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
// const frontendUrl = "https://fitness-studio.surge.sh";
const frontendUrl = "http://localhost:5173";
app.use(express.json());

// socketio connect  start
const socketIo = require("socket.io");
const http = require("http");
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const users = {};

const addUserSocket = (userId, socketId) => {
  users[userId] = socketId;
};

const removeUserSocket = (userId) => {
  delete users[userId];
};

const getUserSocket = (userId) => {
  return users[userId];
};

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  socket.on("user_connected", (data) => {
    const { userId } = data
    if (userId) {
      addUserSocket(userId, socket.id);

    }
    console.log("Connected Users:", users);

  });

  socket.on("notifications", (notificationData) => {
    const { receiverName } = notificationData;

    receiverName.forEach((receiverNames) => {
      const userSocketId = getUserSocket(receiverNames);
      if (userSocketId) {
        io.to(userSocketId).emit("notifications", notificationData);
        console.log("receivers names are", userSocketId);
      } else console.log("no receiver found");
    });
  });

  // Handle incoming messages
  socket.on("message", (message) => {
    console.log("Message received:", message);
    // Broadcast the message to all connected clients
    io.emit("message", message);
  });
  socket.on("refetch", (message) => {
    console.log("Message received:", message);
    // Broadcast the message to all connected clients
    io.emit("refetch", message);
  });
  socket.on("unreadmessage", (message) => {
    console.log("Message received:", message);
    // Broadcast the message to all connected clients
    io.emit("unreadmessage", message);
  });
  socket.on("unread_refetch", (message) => {
    console.log("Message received:", message);
    // Broadcast the message to all connected clients
    io.emit("unread_refetch", message);
  });
  socket.on('read_unread_message', (message) => {
    console.log(message);
    io.emit('read_unread_message', message)
  })
  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    // Find the user's name by their socket ID and remove them from the 'users' object
    const userId = Object.keys(users).find((key) => users[key] === socket.id);
    if (userId) {
      removeUserSocket(userId);
      console.log("removed suer is ", userId);
    }
  });
});
// socketio connect  end

server.listen(port, () => {
  console.log(`Fitness are Running on port ${port}`);
});
