import { ref, onUnmounted } from "vue";
import { storeToRefs } from "pinia";
import axios from "axios";
import Cookies from "js-cookie";
import { useSocketStore } from "@/stores/socket.store";
import { useWebSocket } from "@/composables/useWebSocket";
import { usePaginationStore } from "@/composables/usePaginationStore";
import { useError } from "@/composables/useError";
import type { IMessage } from "@/types";
import {
  ANONYMOUS,
  AUTH_TOKEN_KEY,
  API_URL,
  CHAT_ERROR_MESSAGES,
  MESSAGE_PER_PAGE,
} from "@/constants";

export const useChat = () => {
  const messages = ref<IMessage[]>([]);
  const username = ref<string | null>(null);
  const errorState = ref(null);

  const socketStore = useSocketStore();
  const webSocket = useWebSocket();
  const paginationStore = usePaginationStore();
  const { showError } = useError();

  const { isConnected } = storeToRefs(socketStore);
  const { currentPage, totalPages, loading } = storeToRefs(paginationStore);

  const saveMessages = () => {
    try {
      localStorage.setItem("chat_messages", JSON.stringify(messages.value));
    } catch (error) {
      console.error("Failed to save messages to localStorage:", error);
    }
  };

  const loadMessages = () => {
    try {
      const stored = localStorage.getItem("chat_messages");
      if (stored) {
        messages.value = JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load messages from localStorage:", error);
    }
  };

  const handleNewMessage = (message: IMessage) => {
    messages.value.push(message);
    saveMessages();
  };

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
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        params: { page, limit },
      });

      const existingMessages = messages.value || [];
      const newMessages = [...data.messages, ...existingMessages];

      const uniqueMessages = Array.from(
        new Map(newMessages.map((msg) => [msg.timestamp, msg])).values()
      );

      const sortedMessages = uniqueMessages.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      messages.value = sortedMessages;
      saveMessages();

      paginationStore.totalPages = data.totalPages;
      paginationStore.currentPage = page;

      return {
        messages: sortedMessages,
        currentPage: page,
        totalPages: data.totalPages,
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
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      messages.value = [];
      saveMessages();
    } catch (error) {
      showError(CHAT_ERROR_MESSAGES.CLEAR_MESSAGES_FAILED);
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
      webSocket.sendMessage(message.trim());
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
      webSocket.connect(token);
      webSocket.setupEventListeners(handleNewMessage);

      onUnmounted(() => {
        try {
          webSocket.disconnect();
        } catch {
          showError(CHAT_ERROR_MESSAGES.DISCONNECT_FAILED);
        }
      });
    } catch {
      showError(CHAT_ERROR_MESSAGES.CONNECT_FAILED);
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
    setupWebSocket,
    fetchMessageHistory,
    disconnect: webSocket.disconnect,
  };
};
