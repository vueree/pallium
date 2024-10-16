import express from "express";
import connectDB from "./db.js";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs"; // Импортируем bcrypt
import Message from "./models/message.js"; // Импортируем модель сообщения

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Настройка CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json()); // Не забудьте добавить этот middleware
connectDB();
// Определение схемы пользователя и модели
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model("User", userSchema);

// Обработчик маршрута регистрации
app.post("/register", async (req, res) => {
  console.log("Request body:", req.body);
  const { username, password } = req.body;

  console.log("Received registration request:", { username, password });

  try {
    // Проверка, существует ли пользователь с таким именем
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log("User already exists:", username);
      return res.status(400).json({ error: "User already exists" });
    }

    // Хэширование пароля перед сохранением
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание нового пользователя
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    console.log("User created successfully:", newUser);
    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Error creating user" });
  }
});

// Маршрут для получения всех сообщений
app.get("/getMessages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: -1 }); // Получение сообщений с сортировкой по времени
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Error fetching messages" });
  }
});

// Маршрут для отправки нового сообщения
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

// Маршрут для очистки всех сообщений
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

// Создание WebSocket-сервера
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("Client connected");

  // Отправка существующих сообщений клиенту при подключении
  Message.find().then((messages) => {
    ws.send(JSON.stringify(messages));
  });

  ws.on("message", async (message) => {
    try {
      const newMessage = JSON.parse(message);
      const messageDoc = new Message(newMessage);

      // Сохраняем новое сообщение в базу данных
      await messageDoc.save();

      // Отправляем новое сообщение всем клиентам
      const messageToSend = {
        user: newMessage.user,
        text: newMessage.text,
        timestamp: new Date()
      };

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(messageToSend));
        }
      });
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

// Проверка активности клиентов
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

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
