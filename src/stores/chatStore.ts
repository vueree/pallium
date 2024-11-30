import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { IMessage } from "../types";
import { getSocket } from "../use/useWebSocket";
import axios from "axios";

export const useChatStore = defineStore("chat", () => {
  const messages = ref<IMessage[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const sortedMessages = computed(() => {
    return [...messages.value].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  });

  const addMessage = (message: IMessage) => {
    messages.value.push(message);
  };

  const setMessages = (newMessages: IMessage[]) => {
    messages.value = newMessages;
  };

  const clearAllMessages = () => {
    messages.value = [];
  };

  // Обработчики сокет-событий
  const setupSocketListeners = (socket: any) => {
    socket.on("message_history", (history: IMessage[]) => {
      setMessages(history);
      isLoading.value = false;
    });

    socket.on("new_message", (message: IMessage) => {
      addMessage(message);
    });

    socket.on("error", (err: any) => {
      error.value = err.message;
      isLoading.value = false;
    });
  };

  // Действия
  const loadMessages = async () => {
    isLoading.value = true;
    error.value = null;
    const socket = getSocket();

    if (socket?.connected) {
      socket.emit("get_messages");
    } else {
      error.value = "Socket connection not available";
      isLoading.value = false;
    }
  };

  const sendMessage = async (content: string, token: string) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/chat/send",
        { content },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const socket = getSocket();
      if (socket?.connected) {
        socket.emit("new_message", response.data.newMessage);
      }

      return response.data.newMessage;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    }
  };

  return {
    messages: sortedMessages,
    isLoading,
    error,
    loadMessages,
    sendMessage,
    clearAllMessages,
    setupSocketListeners
  };
});
