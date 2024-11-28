// fetchChat.ts
import { ref } from "vue";
import axios from "axios";
import Cookies from "js-cookie";
import type { IMessage } from "../types";
import { initializeSocket, getSocket, disconnectSocket } from "./useWebSocket";

const API_URL = "http://localhost:3000/api";
const token = Cookies.get("auth_token");
const messagesRef = ref<IMessage[]>([]);

// Сохранение токена в куки
const setToken = (token: string | null) => {
  if (token) {
    Cookies.set("auth_token", token, { expires: 7, secure: true });
    setupSocketListeners();
  } else {
    Cookies.remove("auth_token");
    disconnectSocket();
  }
};

// Настройка слушателей сокета
const setupSocketListeners = () => {
  const socket = getSocket();
  if (socket) {
    // Удаляем существующие слушатели перед добавлением новых
    socket.off("new_message");
    socket.off("message_history");

    // Слушатель истории сообщений
    socket.on("message_history", (messages: IMessage[]) => {
      messagesRef.value = messages;
      console.log("Received message history:", messages);
    });

    // Слушатель новых сообщений
    socket.on("new_message", (message: IMessage) => {
      messagesRef.value.push(message);
      console.log("Received new message:", message);
    });

    // Слушатель ошибок
    socket.on("error", (error: any) => {
      console.error("Socket error:", error);
    });
  }
};

// Создание заголовков авторизации
const createAuthHeaders = () => {
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Метод для входа пользователя
export const loginUser = async (
  username: string,
  password: string,
  router: any
) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username,
      password
    });

    if (response.status === 200) {
      const { token } = response.data;
      setToken(token);
      router.push("/chat");
    }
  } catch (error: any) {
    handleError(error, "Ошибка входа:");
  }
};

// Метод для регистрации пользователя
export const registerUser = async (
  username: string,
  password: string,
  router: any
) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      username,
      password
    });

    if (response.status === 201) {
      const { token } = response.data;
      setToken(token);
      router.push("/chat");
    }
  } catch (error: any) {
    handleError(error, "Ошибка регистрации:");
  }
};

// Метод для отправки сообщения
export const sendMessage = async (content: string): Promise<IMessage> => {
  const token = Cookies.get("auth_token"); // Получаем актуальный токен
  if (!token) {
    throw new Error(
      "Токен отсутствует. Авторизуйтесь, чтобы отправлять сообщения."
    );
  }
  try {
    const response = await axios.post(
      `${API_URL}/chat/send`,
      { content },
      {
        headers: createAuthHeaders()
      }
    );
    const newMessage = response.data.newMessage;
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit("new_message", newMessage); // Отправляем новое сообщение через сокет
    }
    messagesRef.value.push(newMessage); // Добавляем новое сообщение в локальное состояние

    return newMessage;
  } catch (error: any) {
    handleError(error, "Ошибка отправки сообщения:");
    throw new Error("Ошибка отправки сообщения");
  }
};

export const getMessages = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/chat/messages`, {
      headers: createAuthHeaders()
    });
    initializeSocket(token);
    const socket = getSocket();
    console.log("✌️socket --->", socket);
    if (socket && socket.connected) {
      socket.emit("get_messages");
    } else {
      console.error("Socket not connected");
    }
    messagesRef.value = response.data;
  } catch (error) {
    console.error("Ошибка при получении сообщений:", error);
  }
};

// Экспорт состояния сообщений
export const useMessages = () => messagesRef;

// Метод для очистки всех сообщений
export const clearMessages = async (): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/chat/clear`, {
      headers: createAuthHeaders()
    });
    messagesRef.value = [];
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit("messages_cleared");
    }
  } catch (error: any) {
    handleError(error, "Ошибка очистки сообщений:");
  }
};

// Метод для обработки ошибок
const handleError = (error: any, message: string) => {
  if (error.response) {
    console.error(`${message}`, error.response.data.message);
  } else {
    console.error("Ошибка:", error.message);
  }
};
