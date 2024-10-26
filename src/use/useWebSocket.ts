import { io, Socket } from "socket.io-client";

const API_URL = "http://localhost:3000";
let socket: Socket | null = null;

export const initializeSocket = (token: string) => {
  if (!socket) {
    socket = io(`${API_URL}/chat`, {
      auth: { token }
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket?.id);
    });

    socket.on("message", (data) => {
      console.log("Новое сообщение:", data);
    });

    socket.on("connect_error", (err) => {
      console.error("Ошибка подключения:", err);
    });

    socket.on("disconnect", () => {
      console.log("Соединение с WebSocket разорвано");
    });
  }
  return socket;
};

export const sendMessage = (content: string) => {
  if (socket) {
    socket.emit("message", { content });
  } else {
    console.error("Socket не инициализирован");
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
