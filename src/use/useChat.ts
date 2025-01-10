import { onUnmounted } from "vue";
import { AxiosError } from "axios";
import { useRouter } from "vue-router";
import axios from "axios";
import Cookies from "js-cookie";
import { useWebSocketStore } from "@/stores/webSockets.store";
import { usePaginationStore } from "@/use/usePaginationStore";
import { useError } from "@/use/useError";
import type { AuthCredentials, AuthResponse, IMessage } from "@/types";

const router = useRouter();

export const ANONYMOUS = "Anonymous";
export const AUTH_TOKEN_KEY = "auth_token";
export const MESSAGE_PER_PAGE = 20;
export const INPUT_WIDTH = 300;

const API_URL = "http://localhost:3000";

const createAuthHeaders = (token?: string) =>
  token ? { Authorization: `Bearer ${token}` } : {};

export const isAuthenticated = (): boolean => {
  return !!Cookies.get(AUTH_TOKEN_KEY);
};

export const fetchMessageHistory = async (
  page: number,
  limit: number
): Promise<{
  messages: IMessage[];
  currentPage: number;
  totalPages: number;
}> => {
  const { showError } = useError();

  try {
    const token = Cookies.get(AUTH_TOKEN_KEY);
    if (!token) {
      showError("Authentication token not found. Please log in again.");
      throw new Error("Token is not available");
    }

    const { data } = await axios.get<{
      messages: IMessage[];
      totalPages: number;
    }>(`${API_URL}/chat/messages`, {
      headers: createAuthHeaders(token),
      params: { page, limit }
    });

    const store = useWebSocketStore();
    const pagination = usePaginationStore();

    store.addMessages(data.messages);

    pagination.totalPages = data.totalPages;
    pagination.currentPage = page;

    return {
      messages: data.messages,
      currentPage: page,
      totalPages: data.totalPages
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        showError("Session expired. Please log in again.");
      } else if (error.response?.status === 404) {
        showError("No messages found.");
      } else {
        showError(
          `Failed to load messages: ${
            error.response?.data?.message || "Unknown error"
          }`
        );
      }
    } else {
      showError("An unexpected error occurred while loading messages.");
    }
    throw error;
  }
};

export const registerUser = async (
  credentials: AuthCredentials
): Promise<void> => {
  const { showError } = useError();

  try {
    if (!credentials.username || !credentials.password) {
      showError("Username и password обязательны");
      throw new Error("Missing required fields");
    }

    const response = await axios.post<AuthResponse>(
      `${API_URL}/auth/register`,
      credentials
    );

    if (!response.data.token) {
      showError("Ошибка получения токена авторизации");
      throw new Error("Token not received");
    }

    Cookies.set(AUTH_TOKEN_KEY, response.data.token, {
      expires: 7,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });

    // await router.push("/chat");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message: string }>;

      switch (axiosError.response?.status) {
        case 400:
          showError(
            axiosError.response.data.message ||
              "Некорректные данные для регистрации"
          );
          break;
        case 409:
          showError("Пользователь с таким именем уже существует");
          break;
        case 500:
          showError("Ошибка сервера при регистрации");
          break;
        default:
          showError(
            axiosError.response?.data?.message || "Ошибка при регистрации"
          );
      }
    } else {
      showError("Неожиданная ошибка при регистрации");
    }
    throw error;
  }
};

export const loginUser = async (
  credentials: AuthCredentials
): Promise<void> => {
  const { showError } = useError();

  try {
    if (!credentials.username || !credentials.password) {
      showError("Username и password обязательны");
      throw new Error("Missing required fields");
    }

    const response = await axios.post<AuthResponse>(
      `${API_URL}/auth/login`,
      credentials
    );

    if (!response.data.token) {
      showError("Ошибка получения токена авторизации");
      throw new Error("Token not received");
    }

    // Сохраняем токен
    Cookies.set(AUTH_TOKEN_KEY, response.data.token, {
      expires: 1,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });

    // Инициализируем WebSocket соединение
    const webSocketStore = useWebSocketStore();
    webSocketStore.connect(response.data.token);

    // Загружаем начальную историю сообщений через REST
    const pagination = usePaginationStore();
    await fetchMessageHistory(pagination.currentPage, MESSAGE_PER_PAGE);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message: string }>;

      switch (axiosError.response?.status) {
        case 400:
          showError("Неверное имя пользователя или пароль");
          break;
        case 401:
          showError("Неверные учетные данные");
          break;
        case 500:
          showError("Ошибка сервера при входе");
          break;
        default:
          showError(axiosError.response?.data?.message || "Ошибка при входе");
      }
    } else {
      showError("Неожиданная ошибка при входе");
    }
    throw error;
  }
};

export const logout = (): void => {
  Cookies.remove(AUTH_TOKEN_KEY, {
    path: "/",
    // domain: "api-pallium.onrender.com"
    domain: "http://localhost:3000"
  });
  Cookies.remove(AUTH_TOKEN_KEY, {
    path: "/",
    domain: "pallium.onrender.com"
  });
  Cookies.remove(AUTH_TOKEN_KEY, {
    path: "/",
    domain: "http://localhost:3000"
  });

  router.push({ name: "Login" });
};

export const clearMessages = async (): Promise<void> => {
  const { showError } = useError();

  try {
    const token = Cookies.get(AUTH_TOKEN_KEY);
    if (!token) {
      showError("Authentication token not found. Please log in again.");
      throw new Error("Token is not available");
    }

    await axios.delete(`${API_URL}/chat/clear`, {
      headers: createAuthHeaders(token)
    });

    const store = useWebSocketStore();
    store.clearMessages();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        showError("Session expired. Please log in again.");
      } else {
        showError(
          `Failed to clear messages: ${
            error.response?.data?.message || "Unknown error"
          }`
        );
      }
    } else {
      showError("An unexpected error occurred while clearing messages.");
    }
    throw error;
  }
};

export const initializeChat = async (scrollCallback: () => void) => {
  const { showError } = useError();

  try {
    const pagination = usePaginationStore();
    await fetchMessageHistory(pagination.currentPage, MESSAGE_PER_PAGE);
    scrollCallback();
  } catch (error) {
    showError("Failed to initialize chat. Please try refreshing the page.");
    console.error("Chat initialization error:", error);
  }
};

export const loadMoreMessages = async (): Promise<void> => {
  if (
    loading.value ||
    !totalPages.value ||
    currentPage.value >= totalPages.value
  ) {
    return;
  }

  loading.value = true;

  try {
    const nextPage = currentPage.value + 1;
    await fetchMessageHistory(nextPage, 20);
  } catch (error) {
    console.error("Failed to load more messages:", error);
  } finally {
    loading.value = false;
  }
};

export const handleMessageSend = (message: string, resetInput: () => void) => {
  const { showError } = useError();
  const store = useWebSocketStore();

  if (!message.trim()) {
    showError("Message cannot be empty.");
    return;
  }

  if (!store.isConnected) {
    showError("Not connected to chat. Please check your connection.");
    return;
  }

  try {
    store.addMessage({
      message: message.trim(),
      username: store.username || ANONYMOUS,
      timestamp: new Date().toISOString()
    });
    resetInput();
  } catch (error) {
    showError("Failed to send message. Please try again.");
  }
};

export const setupWebSocket = () => {
  const { showError } = useError();
  const store = useWebSocketStore();
  const token = Cookies.get(AUTH_TOKEN_KEY);

  if (!token) {
    showError("Authentication token not found. Please log in again.");
    return;
  }

  try {
    store.connect(token);
    onUnmounted(() => {
      try {
        store.disconnect();
      } catch (error) {
        showError("Error disconnecting from chat.");
      }
    });
  } catch (error) {
    showError("Failed to connect to chat. Please try refreshing the page.");
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
