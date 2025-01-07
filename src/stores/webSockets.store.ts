import { defineStore } from "pinia";
import { useRouter } from "vue-router";
import { ref, watch, nextTick } from "vue";
import type { IMessage } from "../types";

export const useWebSocketStore = defineStore("webSocketStore", () => {
  const token = ref<string | null>(null); // Токен WebSocket
  const messages = ref<IMessage[]>([]); // Сообщения
  const isConnected = ref(false); // Состояние WebSocket
  const username = ref<string>(""); // Добавляем свойство username
  const socket = ref<WebSocket | null>(null);
  const router = useRouter();

  let reconnectTimeout: NodeJS.Timeout | null = null; // Таймаут для переподключения

  // Установка token
  const setToken = (newToken: string) => {
    const maskedToken = newToken.slice(0, 10) + "..." + newToken.slice(-4); // Маскировка токена
    console.log("🚀 ~ setToken ~ newToken:", maskedToken);
    token.value = newToken;

    // Используем nextTick, чтобы дождаться следующего цикла обновления
    nextTick(() => {
      console.log("Token after nextTick:", token.value);
      if (!token.value) {
        router.push({ name: "Login" }); // Перенаправление, если токен пустой
      }
    });
  };

  const addMessages = (newMessages: IMessage[]) => {
    const uniqueMessages = newMessages.filter(
      (msg) => !messages.value.find((m) => m.id === msg.id)
    );
    messages.value = [...uniqueMessages, ...messages.value];
  };

  const addMessage = (newMessage: IMessage) => {
    console.log("🚀 ~ addMessage ~ newMessage:", newMessage);
    if (!messages.value.find((msg) => msg.id === newMessage.id)) {
      messages.value.push(newMessage);
    }
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

    const url = "ws://localhost:3000/chat"; // Используем токен в URL

    socket.value = new WebSocket(url);

    socket.value.onopen = () => {
      isConnected.value = true;
      console.log("🚀 ~ WebSocket connected");
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout); // Сбрасываем таймаут переподключения
        reconnectTimeout = null;
      }
    };

    socket.value.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("🚀 ~ WebSocket onmessage ~ data:", data);
        if (Array.isArray(data)) {
          addMessages(data); // Если получен массив сообщений
        } else {
          addMessage(data); // Если получено одно сообщение
        }
      } catch (error) {
        console.error("🚀 ~ WebSocket onmessage error:", error);
      }
    };

    socket.value.onerror = (error) => {
      console.error("🚀 ~ WebSocket error:", error);
    };

    socket.value.onclose = () => {
      isConnected.value = false;
      socket.value = null;
      console.log("🚀 ~ WebSocket disconnected");

      // Попытка переподключения через 5 секунд
      if (!reconnectTimeout) {
        reconnectTimeout = setTimeout(() => {
          console.log("🚀 ~ Reconnecting WebSocket...");
          connect(token); // Повторное подключение
        }, 5000);
      }
    };
  };

  // Отключение WebSocket
  const disconnect = () => {
    console.log("🚀 ~ disconnect ~ Disconnecting WebSocket...");

    // Проверка, есть ли активное соединение
    if (socket.value && isConnected.value) {
      socket.value.close();
      socket.value = null;
      isConnected.value = false;
      console.log("🚀 ~ WebSocket disconnected");
    } else {
      console.log("🚀 ~ disconnect ~ No active WebSocket connection");
    }

    // Очищаем таймаут переподключения, если он существует
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
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
    token, // Токен WebSocket
    messages,
    isConnected,
    connect,
    disconnect,
    addMessages,
    addMessage,
    clearMessages,
    username,
    setToken,
    socket
  };
});
