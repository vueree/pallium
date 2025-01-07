import { onUnmounted } from "vue";
import axios from "axios";
import Cookies from "js-cookie";
import { useWebSocketStore } from "@/stores/webSockets.store";
import { usePaginationStore } from "@/use/usePaginationStore";
import type { IMessage } from "../types";

export const ANONYMOUS = "Anonymous";
export const AUTH_TOKEN_KEY = "auth_token";
export const MESSAGE_PER_PAGE = 10;
export const INPUT_WIDTH = 300;

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// Создание заголовков авторизации
const createAuthHeaders = (token?: string) =>
  token ? { Authorization: `Bearer ${token}` } : {};

// Обработка ошибок API
const handleApiError = (error: any, context: string) => {
  console.error(`${context}:`, error?.response?.data?.message || error.message);
  throw error;
};

export const loginUser = async (
  username: string,
  password: string,
  router: any
) => {
  try {
    // Логика авторизации, например запрос в API
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data = await response.json();
    // Сохраняем токен в cookies
    Cookies.set(AUTH_TOKEN_KEY, data.token, { expires: 7, secure: true });

    // Сохраняем имя пользователя
    localStorage.setItem("username", username);

    // Ожидаем подключения WebSocket
    const store = useWebSocketStore();
    if (store.token) {
      await store.connect(store.token); // Убедитесь, что токен уже передан
    }

    // Перенаправляем на страницу чата после успешного подключения WebSocket
    router.push("/chat");
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const registerUser = async (
  username: string,
  password: string,
  router: any
) => {
  try {
    // Логика регистрации, например запрос в API
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Registration failed");
    }

    const data = await response.json();
    // Сохраняем токен и имя пользователя
    Cookies.set(AUTH_TOKEN_KEY, data.token, { expires: 7, secure: true });
    localStorage.setItem("username", username);

    // После успешной регистрации редиректим на страницу чата
    router.push("/chat");
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

// REST API: Получение истории сообщений
export const fetchMessageHistory = async (
  page: number,
  limit: number
): Promise<void> => {
  try {
    const token = Cookies.get(AUTH_TOKEN_KEY);
    if (!token) throw new Error("Token is not available");

    const { data } = await axios.get<{
      messages: IMessage[];
      totalPages: number;
    }>(`${API_URL}/chat/messages`, {
      headers: createAuthHeaders(token),
      params: { page, limit }
    });

    const store = useWebSocketStore();
    const pagination = usePaginationStore();
    store.addMessages(data.messages); // Добавляем сообщения в хранилище
    pagination.totalPages = data.totalPages; // Обновляем общее количество страниц
    pagination.currentPage = page; // Устанавливаем текущую страницу
  } catch (error) {
    handleApiError(error, "Error fetching message history");
  }
};

// REST API: Очистка сообщений
export const clearMessages = async (): Promise<void> => {
  try {
    const token = Cookies.get(AUTH_TOKEN_KEY);
    if (!token) throw new Error("Token is not available");

    await axios.delete(`${API_URL}/chat/clear`, {
      headers: createAuthHeaders(token)
    });

    const store = useWebSocketStore();
    store.clearMessages(); // Очищаем сообщения в хранилище
  } catch (error) {
    handleApiError(error, "Error clearing messages");
  }
};

// Инициализация чата (загрузка истории и скролл)
export const initializeChat = async (scrollCallback: () => void) => {
  try {
    const pagination = usePaginationStore();
    await fetchMessageHistory(pagination.currentPage, MESSAGE_PER_PAGE); // Загружаем первую страницу
    scrollCallback(); // Скролл к последнему сообщению
  } catch (error) {
    console.error("Chat initialization error:", error);
  }
};

// Пагинация: Загрузка старых сообщений
export const loadMoreMessages = async () => {
  const pagination = usePaginationStore();
  if (pagination.currentPage < pagination.totalPages && !pagination.loading) {
    pagination.loading = true;
    await fetchMessageHistory(pagination.currentPage + 1, MESSAGE_PER_PAGE); // Загрузка следующей страницы
    pagination.loading = false;
  }
};

// Обработка отправки сообщения
export const handleMessageSend = (message: string, resetInput: () => void) => {
  const store = useWebSocketStore();
  if (!message.trim() || !store.isConnected) return;

  store.addMessage({
    message: message.trim(),
    username: store.username || ANONYMOUS,
    timestamp: new Date().toISOString()
  });

  resetInput(); // Сброс поля ввода
};

export const setupWebSocket = () => {
  const store = useWebSocketStore();
  const token = Cookies.get(AUTH_TOKEN_KEY);

  if (token) {
    store.connect(token);
    onUnmounted(() => store.disconnect());
  }
};

export const handleKeyPress = (event: KeyboardEvent, callback: () => void) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    callback();
  }
};

export const useChatState = () => {
  return {
    handleMessageSend,
    initializeChat,
    loadMoreMessages,
    clearMessages,
    handleKeyPress,
    setupWebSocket
  };
};
