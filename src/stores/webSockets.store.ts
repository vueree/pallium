// src/stores/webSockets.store.ts
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

  const connect = (token: string) => {
    initializeSocket(token);
    const socket = getSocket();

    if (socket) {
      socket.on("message_history", (history: IMessage[]) => {
        messages.value = history; // Загрузка истории сообщений
      });

      socket.on("new_message", (message: IMessage) => {
        messages.value.push(message); // Добавление нового сообщения
      });

      socket.on("messages_cleared", () => {
        messages.value = []; // Очистка всех сообщений
      });
    }
  };

  const disconnect = () => {
    disconnectSocket();
    messages.value = [];
  };

  return { messages, connect, disconnect };
});
