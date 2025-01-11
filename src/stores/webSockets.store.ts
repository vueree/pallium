import { defineStore } from "pinia";
import { useRouter } from "vue-router";
import { ref, watch, nextTick } from "vue";
import type { IMessage } from "@/types";
import { initializeSocket, disconnectSocket } from "@/composables/useWebSocket";

export const useWebSocketStore = defineStore("webSocketStore", () => {
  const token = ref<string | null>(null);
  const messages = ref<IMessage[]>([]);
  const isConnected = ref(false);
  const username = ref<string>("");
  const socket = ref<WebSocket | null>(null);
  const router = useRouter();

  const setToken = (newToken: string) => {
    const maskedToken = newToken.slice(0, 10) + "..." + newToken.slice(-4);
    token.value = newToken;

    nextTick(() => {
      if (!token.value) {
        router.push({ name: "Login" });
      }
    });
  };

  // Добавление сообщений из REST API
  const addMessages = (newMessages: IMessage[]) => {
    messages.value = [...newMessages, ...messages.value];
    sortMessages();
  };

  // Добавление нового сообщения из WebSocket
  const addMessage = (newMessage: IMessage) => {
    console.log("🚀 ~ addMessage ~ newMessage:", newMessage);
    if (!messages.value.find((msg) => msg.id === newMessage.id)) {
      messages.value.unshift(newMessage);
    }
  };

  // Сортировка сообщений (новые сверху)
  const sortMessages = () => {
    messages.value.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  const clearMessages = () => {
    console.log("🚀 ~ clearMessages ~ clearing all messages");
    messages.value = [];
  };

  const connect = (token: string) => {
    if (!token) {
      console.error("Token is required for WebSocket connection");
      return;
    }

    const socketInstance = initializeSocket(token);
    if (socketInstance) {
      isConnected.value = true;

      socketInstance.on("new_message", (message: IMessage) => {
        addMessage(message);
      });
    }
  };

  const disconnect = () => {
    disconnectSocket();
    isConnected.value = false;
    socket.value = null;
  };

  watch(
    token,
    (newToken) => {
      if (!newToken) {
        console.log("🚨 Token is missing, redirecting to Login...");
        router.push({ name: "Login" });
      }
    },
    { immediate: true }
  );

  return {
    token,
    messages,
    isConnected,
    connect,
    disconnect,
    addMessage,
    addMessages,
    clearMessages,
    username,
    setToken,
    socket
  };
});
