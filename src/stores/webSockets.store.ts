import { defineStore } from "pinia";
import { ref } from "vue";
import {
  initializeSocket,
  disconnectSocket,
  getSocket
} from "../use/useWebSocket";
import { messagesRef } from "@/use/fetchChat";
import type { IMessage } from "../types";

export const useWebSocketStore = defineStore("webSocket", () => {
  const messages = ref<IMessage[]>([]);
  const isConnected = ref(false);

  const connect = (token: string | undefined) => {
    if (token) {
      initializeSocket(token);
    }

    const socket = getSocket();

    if (socket) {
      socket.on("connect", () => {
        isConnected.value = true;
        console.log("WebSocket connected");
      });

      socket.on("disconnect", () => {
        isConnected.value = false;
        console.log("WebSocket disconnected");
      });

      // Обработка нового сообщения
      socket.on("new_message", (message: IMessage) => {
        console.log("Received new message:", message);
        messagesRef.value.unshift(message); // Обновляем messagesRef
      });

      // Обработка истории сообщений
      socket.on("message_history", (history: IMessage[]) => {
        messagesRef.value = history; // Загружаем историю в messagesRef
      });

      // Обработка очистки сообщений
      socket.on("messages_cleared", () => {
        messagesRef.value = []; // Очищаем messagesRef
      });
    }
  };

  const sendMessage = (messageData: { message: string; username: string }) => {
    const socket = getSocket();
    if (socket) {
      socket.emit("send_message", messageData);
    } else {
      console.error("Socket not connected");
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
    getSocket
  };
});
