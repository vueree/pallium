import { ref, onUnmounted } from "vue";
import { storeToRefs } from "pinia";
import axios from "axios";
import Cookies from "js-cookie";
import { useSocketStore } from "@/stores/socket.store";
import { usePaginationStore } from "@/composables/usePaginationStore";
import { useError } from "@/composables/useError";
import {
  ANONYMOUS,
  AUTH_TOKEN_KEY,
  API_URL,
  CHAT_ERROR_MESSAGES,
  MESSAGES_STORAGE_KEY,
  MESSAGE_PER_PAGE
} from "@/constants";
import type { IMessage } from "@/types";

const saveMessagesToStorage = (messages: IMessage[]) => {
  try {
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error("Failed to save messages to localStorage:", error);
  }
};

const loadMessagesFromStorage = (): IMessage[] => {
  try {
    const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load messages from localStorage:", error);
    return [];
  }
};

const createAuthHeaders = (token?: string) =>
  token ? { Authorization: `Bearer ${token}` } : {};

export const useChat = () => {
  const errorState = ref(null);

  const socketStore = useSocketStore();
  const paginationStore = usePaginationStore();
  const { showError } = useError();

  const { messages, isConnected, username } = storeToRefs(socketStore);
  const { currentPage, totalPages, loading } = storeToRefs(paginationStore);

  const fetchMessageHistory = async (
    page: number,
    limit: number
  ): Promise<{
    messages: IMessage[];
    currentPage: number;
    totalPages: number;
  }> => {
    const token = Cookies.get(AUTH_TOKEN_KEY);

    if (!token) {
      showError(CHAT_ERROR_MESSAGES.TOKEN_NOT_FOUND);
      throw new Error("Token is not available");
    }

    try {
      const { data } = await axios.get<{
        messages: IMessage[];
        totalPages: number;
      }>(`${API_URL}/chat/messages`, {
        headers: createAuthHeaders(token),
        params: { page, limit }
      });

      const existingMessages = socketStore.messages || [];
      const newMessages = [...data.messages, ...existingMessages];

      const uniqueMessages = Array.from(
        new Map(newMessages.map((msg) => [msg.timestamp, msg])).values()
      );

      const sortedMessages = uniqueMessages.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      socketStore.setMessages(sortedMessages);
      saveMessagesToStorage(sortedMessages);

      paginationStore.totalPages = data.totalPages;
      paginationStore.currentPage = page;

      return {
        messages: sortedMessages,
        currentPage: page,
        totalPages: data.totalPages
      };
    } catch (error) {
      showError(CHAT_ERROR_MESSAGES.LOAD_MESSAGES_FAILED);
      throw error;
    }
  };

  const clearMessages = async (): Promise<void> => {
    const token = Cookies.get(AUTH_TOKEN_KEY);

    if (!token) {
      showError(CHAT_ERROR_MESSAGES.TOKEN_NOT_FOUND);
      throw new Error("Token is not available");
    }

    try {
      await axios.delete(`${API_URL}/chat/clear`, {
        headers: createAuthHeaders(token)
      });

      socketStore.clearMessages();
      localStorage.removeItem(MESSAGES_STORAGE_KEY);
    } catch (error) {
      showError(CHAT_ERROR_MESSAGES.CLEAR_MESSAGES_FAILED);
    }
  };

  const loadMoreMessages = async (): Promise<void> => {
    if (
      loading.value ||
      !totalPages.value ||
      currentPage.value >= totalPages.value
    )
      return;

    loading.value = true;

    try {
      const nextPage = currentPage.value + 1;
      await fetchMessageHistory(nextPage, MESSAGE_PER_PAGE);
    } catch (error) {
      showError(CHAT_ERROR_MESSAGES.LOAD_MESSAGES_FAILED);
    } finally {
      loading.value = false;
    }
  };

  const handleMessageSend = (message: string, resetInput: () => void) => {
    if (!message.trim()) {
      showError(CHAT_ERROR_MESSAGES.EMPTY_MESSAGE);
      return;
    }

    if (!isConnected.value) {
      showError(CHAT_ERROR_MESSAGES.NOT_CONNECTED);
      return;
    }

    try {
      const newMessage = {
        message: message.trim(),
        username: username.value || ANONYMOUS,
        timestamp: new Date().toISOString()
      };

      socketStore.addMessage(newMessage);
      const updatedMessages = [...messages.value];
      saveMessagesToStorage(updatedMessages);

      resetInput();
    } catch (error) {
      showError(CHAT_ERROR_MESSAGES.SEND_MESSAGE_FAILED);
    }
  };

  const setupWebSocket = () => {
    const token = Cookies.get(AUTH_TOKEN_KEY);

    if (!token) {
      showError(CHAT_ERROR_MESSAGES.TOKEN_NOT_FOUND);
      return;
    }

    try {
      socketStore.connect(token);

      const storedMessages = loadMessagesFromStorage();
      if (storedMessages.length > 0) {
        socketStore.setMessages(storedMessages);
      }

      onUnmounted(() => {
        try {
          socketStore.disconnect();
        } catch {
          showError(CHAT_ERROR_MESSAGES.DISCONNECT_FAILED);
        }
      });
    } catch {
      showError(CHAT_ERROR_MESSAGES.CONNECT_FAILED);
    }
  };

  const handleKeyPress = (event: KeyboardEvent, callback: () => void) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      callback();
    }
  };

  const disconnect = () => {
    try {
      socketStore.disconnect();
    } catch (error) {
      showError(CHAT_ERROR_MESSAGES.DISCONNECT_FAILED);
    }
  };

  return {
    messages,
    isConnected,
    username,
    currentPage,
    totalPages,
    loading,
    errorState,
    clearMessages,
    loadMoreMessages,
    handleMessageSend,
    handleKeyPress,
    setupWebSocket,
    fetchMessageHistory,
    disconnect
  };
};
