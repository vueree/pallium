import axios from "axios";
import Cookies from "js-cookie";
import { ref, computed } from "vue";
import { useSocketStore } from "@/stores/socket.store";
import { usePaginationStore } from "@/composables/usePaginationStore";
import { useChat } from "@/composables/useChat";
import apiClient from "@/api/api";
import { useRouter } from "vue-router";
import { io } from "socket.io-client";

import {
  AUTH_TOKEN_KEY,
  MESSAGE_PER_PAGE,
  API_URL,
  AUTH_ERROR_MESSAGES,
  DEFAULT_ERROR_MESSAGES
} from "@/constants";
import type { Router } from "vue-router";
import type {
  AuthState,
  AuthMode,
  AuthCredentials,
  AuthResponse
} from "@/types";
import type { AxiosError } from "axios";

const validateCredentials = (credentials: AuthCredentials): string | null => {
  if (!credentials.username || !credentials.password) {
    return "Username и password обязательны";
  }
  return null;
};

const validateToken = (token: string): string => {
  if (!token) return "";

  return token.startsWith("Bearer ") ? token.replace("Bearer ", "") : token;
};

const formatAuthError = (
  error: unknown,
  mode: "register" | "login"
): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message: string }>;
    const status = String(axiosError.response?.status);
    const message = axiosError.response?.data?.message;

    if (message === "Session ID unknown") {
      return "Session expired or invalid, please log in again.";
    }

    const errorMessages = AUTH_ERROR_MESSAGES[mode];
    const defaultMessage = DEFAULT_ERROR_MESSAGES[mode];
    return message || errorMessages[status] || defaultMessage;
  }

  return mode === "register"
    ? "Unexpected error during registration"
    : "Unexpected error during login";
};

const handleAuthResponse = async (
  response: AuthResponse,
  tokenExpiry: number
): Promise<void> => {
  const { token } = response;
  if (!token) {
    throw new Error("Ошибка получения токена авторизации");
  }

  // Сохраняем токен без префикса Bearer
  Cookies.set(AUTH_TOKEN_KEY, token, {
    expires: tokenExpiry,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  });

  // Подключаем сокет
  const socketStore = useSocketStore();
  socketStore.connect(token);

  // Загружаем историю сообщений
  const pagination = usePaginationStore();
  const { fetchMessageHistory } = useChat();
  await fetchMessageHistory(pagination.currentPage, MESSAGE_PER_PAGE);
};

const loginUser = async (credentials: AuthCredentials): Promise<void> => {
  const validationError = validateCredentials(credentials);
  if (validationError) {
    throw new Error(validationError);
  }

  try {
    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      credentials
    );

    if (!response.data || !response.data.token) {
      throw new Error("Token not received from server");
    }

    const cleanToken = validateToken(response.data.token);
    await handleAuthResponse({ ...response.data, token: cleanToken }, 1);
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

const registerUser = async (credentials: AuthCredentials): Promise<void> => {
  const validationError = validateCredentials(credentials);
  if (validationError) {
    throw new Error(validationError);
  }

  try {
    const response = await axios.post<AuthResponse>(
      `${API_URL}/auth/register`,
      credentials
    );

    if (response.data.token) {
      const cleanToken = validateToken(response.data.token);
      await handleAuthResponse({ ...response.data, token: cleanToken }, 7);
    } else {
      throw new Error("Token not received from server");
    }
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

export const useAuth = () => {
  const state = ref<AuthState>({
    username: "",
    password: "",
    isLoading: false,
    error: null
  });

  const isFormValid = computed(() => {
    return state.value.username.length > 0 && state.value.password.length >= 6;
  });

  const resetForm = () => {
    state.value = {
      username: "",
      password: "",
      isLoading: false,
      error: null
    };
  };

  const handleSubmit = async (mode: AuthMode, router: Router) => {
    state.value.isLoading = true;
    state.value.error = null;

    try {
      const credentials = {
        username: state.value.username,
        password: state.value.password
      };

      if (mode === "login") {
        await loginUser(credentials);
      } else {
        await registerUser(credentials);
      }

      await router.push({ name: "Chat" });
      resetForm();
    } catch (error) {
      state.value.error = formatAuthError(error, mode);
      throw error;
    } finally {
      state.value.isLoading = false;
    }
  };

  return {
    state,
    isFormValid,
    handleSubmit
  };
};
