import { ref } from "vue";
import axios from "axios";
import Cookies from "js-cookie";
import type { IMessage } from "../types";
import { initializeSocket, getSocket } from "./useWebSocket";

const API_URL = "http://localhost:3000/api";
const token = Cookies.get("auth_token");
const messagesRef = ref<IMessage[]>([]); // Подразумевается, что у вас есть тип IMessage

// Сохранение токена в куки
const setToken = (token: string | null) => {
  if (token) {
    Cookies.set("auth_token", token, { expires: 7, secure: true });
  } else {
    Cookies.remove("auth_token");
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
      setToken(token); // Сохранение токена
      initializeSocket(token); // Инициализация WebSocket с токеном
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
      setToken(token); // Сохранение токена
      initializeSocket(token); // Инициализация WebSocket с токеном
      router.push("/chat");
    }
  } catch (error: any) {
    handleError(error, "Ошибка регистрации:");
  }
};

// Метод для отправки сообщения
export const sendMessage = async (content: string): Promise<IMessage> => {
  try {
    const response = await axios.post(
      `${API_URL}/chat/send`,
      { content },
      {
        headers: createAuthHeaders()
      }
    );

    const newMessage = response.data;
    getSocket()?.emit("new_message", newMessage); // Отправка сообщения через WebSocket
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
    messagesRef.value = response.data; // Сохраняем сообщения
  } catch (error) {
    console.error("Ошибка при получении сообщений:", error);
  }
};

export const useMessages = () => messagesRef;

// Метод для очистки всех сообщений
export const clearMessages = async (token: string): Promise<void> => {
  try {
    const response = await axios.delete(`${API_URL}/chat/clear`, {
      headers: createAuthHeaders()
    });
    messagesRef.value = response.data;
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
