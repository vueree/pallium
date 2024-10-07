import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws"; // Импортируем WebSocketServer из библиотеки ws
import debugModule from "debug";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const debug = debugModule("server");
const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 3000;

// Настройка CORS
app.use(
  cors({
    origin: "http://localhost:5173", // Разрешаем доступ только с этого источника
    methods: ["GET", "POST", "OPTIONS"], // Указываем разрешенные методы
    allowedHeaders: ["Content-Type", "Authorization"] // Указываем разрешенные заголовки
  })
);

app.use(express.json());

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

let messages = [];

// Загрузка сообщений из файла
const loadMessages = () => {
  try {
    const data = fs.readFileSync(join(__dirname, "messages.json"), "utf8");
    messages = data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading messages:", error);
    messages = [];
  }
};

// Сохранение сообщений в файл
const saveMessages = () => {
  try {
    fs.writeFileSync(
      join(__dirname, "messages.json"),
      JSON.stringify(messages)
    );
  } catch (error) {
    console.error("Error saving messages:", error);
  }
};

// Загружаем существующие сообщения
loadMessages();

wss.on("connection", (ws) => {
  console.log("Client connected");

  // Отправка существующих сообщений клиенту при подключении
  ws.send(JSON.stringify(messages));

  ws.on("message", (message) => {
    const newMessage = JSON.parse(message);
    messages.push(newMessage);
    saveMessages(); // Сохраняем сообщения

    // Отправляем сообщение всем клиентам
    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        // Используем client вместо WebSocket
        client.send(JSON.stringify(newMessage)); // Посылаем новое сообщение всем клиентам
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
app.get("/messages", (req, res) => {
  res.json(messages); // Возвращаем загруженные сообщения из файла
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
