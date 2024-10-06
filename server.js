import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import debugModule from "debug";

const debug = debugModule("server");
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 120000,
  pingInterval: 5000
});

const PORT = process.env.PORT || 5173;

let messages = [];

io.on("connection", (socket) => {
  debug(`New client connected: ${socket.id}`);
  console.log(`New client connected: ${socket.id}`);

  // Send chat history to the new client
  debug(`Sending chat history to client: ${socket.id}`);
  socket.emit("chat history", messages);

  // Handle new messages
  socket.on("chat message", (msg) => {
    debug(`Received new message from ${socket.id}: ${JSON.stringify(msg)}`);
    const message = {
      id: Date.now(),
      text: msg.text,
      user: msg.user,
      timestamp: new Date()
    };
    messages.push(message);
    debug(`Broadcasting message to all clients`);
    io.emit("chat message", message);
  });

  // Handle client disconnection
  socket.on("disconnect", (reason) => {
    debug(`Client disconnected: ${socket.id}, reason: ${reason}`);
    console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
  });

  // Handle errors
  socket.on("error", (error) => {
    debug(`Error for client ${socket.id}: ${error.message}`);
    console.error(`Error for client ${socket.id}: ${error.message}`);
  });
});

// Handle connection errors
io.on("connect_error", (err) => {
  debug(`Connection error: ${err.message}`);
  console.error(`Connection error: ${err.message}`);
});

// Handle server errors
server.on("error", (error) => {
  debug(`Server error: ${error.message}`);
  console.error(`Server error: ${error.message}`);
});

server.listen(PORT, () => {
  debug(`Server is running on port ${PORT}`);
  console.log(`Server is running on port ${PORT}`);
});

// Add a basic route for testing
app.get("/", (req, res) => {
  res.send("Socket.IO server is running");
});
