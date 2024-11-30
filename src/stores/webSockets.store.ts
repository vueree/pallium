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

  const connect = (token: string | undefined) => {
    initializeSocket(token);
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

      // Обрабатываем событие new_message
      socket.on("new_message", (message: IMessage) => {
        messages.value.push(message); // Добавляем новое сообщение
      });

      socket.on("message_history", (history: IMessage[]) => {
        messages.value = history; // Загружаем историю сообщений
      });

      socket.on("messages_cleared", () => {
        messages.value = []; // Очистка всех сообщений
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
    messages.value = []; // Очистка сообщений при отключении
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
