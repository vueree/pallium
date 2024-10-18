import express from "express";
import connectDB from "./db.js";
import http from "http";
import WebSocket from "ws";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import Message from "./models/message.js";

const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = [];

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());

connectDB();

wss.on("connection", (ws) => {
  clients.push(ws);
  console.log("Client connected. Total clients:", clients.length);

  ws.on("message", (message) => {
    console.log("Received message:", message);

    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on("close", () => {
    const index = clients.indexOf(ws);
    if (index !== -1) {
      clients.splice(index, 1);
      console.log("Client disconnected. Total clients:", clients.length);
    }
  });
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model("User", userSchema);

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ error: "Error creating user" });
  }
});

app.get("/getMessages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Error fetching messages" });
  }
});

app.post("/messages", async (req, res) => {
  const { user, text } = req.body;

  try {
    const newMessage = new Message({ user, text });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: "Error sending message" });
  }
});

app.post("/clearMessages", (req, res) => {
  const { cleaning } = req.body;

  if (cleaning === true) {
    Message.deleteMany({})
      .then(() => {
        res.json({ success: true, message: "Messages cleared successfully" });
      })
      .catch((err) => {
        res
          .status(500)
          .json({ success: false, message: "Failed to clear messages" });
      });
  } else {
    res.status(400).json({ success: false, message: "Invalid request" });
  }
});

const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on("close", () => {
  clearInterval(interval);
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
