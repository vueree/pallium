import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import debugModule from "debug";
import cors from "cors";
import mongoose from "mongoose";

const debug = debugModule("server");
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

app.use(express.json());

// Подключение к MongoDB
mongoose
  .connect("mongodb://localhost:27017/messagesDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Подключено к MongoDB");
  })
  .catch((err) => {
    console.error("Ошибка подключения к MongoDB:", err);
  });

// Создание схемы и модели для сообщений
const messageSchema = new mongoose.Schema({
  content: String,
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model("Message", messageSchema);

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Что-то пошло не так!" });
});

// Запуск сервера
server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});

// Создание WebSocket-сервера
const wss = new WebSocketServer({ server });

// Загрузка сообщений из базы данных
const loadMessages = async () => {
  try {
    const messages = await Message.find();
    return messages;
  } catch (error) {
    console.error("Error loading messages:", error);
    return [];
  }
};

// Загружаем существующие сообщения при запуске сервера
loadMessages().then((messages) => {
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(messages));
    }
  });
});

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", async (message) => {
    const newMessage = JSON.parse(message);

    // Сохраняем новое сообщение в базу данных
    const savedMessage = new Message(newMessage);
    await savedMessage.save();

    // Отправляем сообщение всем клиентам
    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify(newMessage));
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

// Serve messages on GET request
app.get("/getMessages", async (req, res) => {
  const messages = await loadMessages(); // Возвращаем загруженные сообщения из базы данных
  res.json(messages);
});

// Метод POST для очистки сообщений
app.post("/clearMessages", async (req, res) => {
  const { cleaning } = req.body;

  if (cleaning === true) {
    await Message.deleteMany(); // Очищаем все сообщения из базы данных
    res.json({ success: true, message: "Messages cleared successfully" });
  } else {
    res.status(400).json({ success: false, message: "Invalid request" });
  }
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
