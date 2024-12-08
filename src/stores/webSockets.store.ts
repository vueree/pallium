import { defineStore } from "pinia";
import { ref } from "vue";
import {
  initializeSocket,
  disconnectSocket,
  getSocket
} from "../use/useWebSocket";
import type { IMessage } from "../types";

export const useWebSocketStore = defineStore("webSocket", () => {
  const messages = ref<IMessage[]>([]);
  const isConnected = ref(false);

  const setMessages = (newMessages: IMessage[]) => {
    messages.value = newMessages;
  };

  const setupSocketListeners = () => {
    const socket = getSocket();

    if (socket) {
      socket.off("new_message");
      socket.off("message_history");
      socket.off("messages_cleared");

      socket.on(
        "message_history",
        (data: { messages: IMessage[]; page: number; totalPages: number }) => {
          if (data.page === 1) {
            setMessages(data.messages); // Для первой страницы — перезаписываем
          } else {
            messages.value.push(...data.messages); // Для остальных — добавляем в начало
          }
        }
      );

      socket.on("new_message", (content: IMessage) => {
        messages.value.push(content);
      });

      socket.on("messages_cleared", () => {
        setMessages([]);
      });

      socket.on("error", (error: Error) => {
        console.error("🔴 Socket error in store:", error);
      });
    } else {
      console.warn("⚠️ Cannot setup listeners: socket is null");
    }
  };

  const connect = (token: string | undefined) => {
    if (!token) {
      console.error("🔴 Token is required for WebSocket connection");
      return;
    }

    const socket = initializeSocket(token);

    if (socket) {
      socket.on("connect", () => {
        isConnected.value = true;
        setupSocketListeners();
      });

      socket.on("disconnect", () => {
        isConnected.value = false;
      });
    } else {
      console.error("🔴 Failed to initialize socket");
    }
  };

  const sendMessage = (messageData: { message: string; username: string }) => {
    const socket = getSocket();

    if (socket?.connected) {
      socket.emit("send_message", messageData);
    } else {
      console.error("🔴 Cannot send message: socket not connected");
    }
  };

  const disconnect = () => {
    disconnectSocket();
    isConnected.value = false;
    messages.value = [];
  };

  return {
    messages,
    isConnected,
    connect,
    disconnect,
    sendMessage,
    getSocket,
    setMessages
  };
});
