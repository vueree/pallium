import { ref } from "vue";
import axios from "axios";
import Cookies from "js-cookie";
import type { IMessage } from "../types";
import { getSocket, disconnectSocket } from "./useWebSocket";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const token = Cookies.get("auth_token");
export const messagesRef = ref<IMessage[]>([]);

const setToken = (token: string | null) => {
  if (token) {
    Cookies.set("auth_token", token, { expires: 7, secure: true });
    setupSocketListeners();
  } else {
    Cookies.remove("auth_token");
    disconnectSocket();
  }
};

const setupSocketListeners = () => {
  const socket = getSocket();
  if (socket) {
    socket.off("new_message");
    socket.off("message_history");

    socket.on("message_history", (content: IMessage[]) => {
      messagesRef.value = content;
      console.log("Received message history:", content);
    });

    socket.on("new_message", (content: IMessage) => {
      messagesRef.value.unshift(content);
      console.log("Received new content:", content);
    });

    socket.on("error", (error: any) => {
      console.error("Socket error:", error);
    });
  }
};

const createAuthHeaders = (token: string | undefined) => {
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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

      localStorage.setItem("username", username);

      router.push("/chat");
    }
  } catch (error: any) {
    handleError(error, "Ошибка входа:");
  }
};

export const registerUser = async (
  username: string,
  password: string,
  router: any
) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Неизвестная ошибка");
    }

    const data = await response.json();
    console.log("User registered:", data);

    localStorage.setItem("username", username);

    router.push("/chat");
  } catch (error) {
    console.error("Ошибка регистрации:", error.message);
  }
};

export const useMessages = () => messagesRef;

export const getMessages = async () => {
  try {
    const response = await axios.get(`${API_URL}/chat/messages`, {
      headers: createAuthHeaders(token)
    });
    messagesRef.value = response.data;
  } catch (error) {
    console.error("Ошибка при получении сообщений:", error);
  }
};

export const clearMessages = async (): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/chat/clear`, {
      headers: createAuthHeaders(token)
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

const handleError = (error: any, content: string) => {
  if (error.response) {
    console.error(`${content}`, error.response.data.content);
  } else {
    console.error("Ошибка:", error.content);
  }
};
