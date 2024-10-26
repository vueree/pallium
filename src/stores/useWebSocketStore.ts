import { defineStore } from "pinia";
import { ref } from "vue";

export const useWebSocketStore = defineStore("webSocket", () => {
  const isConnected = ref(false);
  console.log("✌️isConnected --->", isConnected);
  const messages = ref<any[]>([]); // Хранение сообщений

  const setConnectionStatus = (status: boolean) => {
    isConnected.value = status;
  };

  const addMessage = (message: any) => {
    messages.value.push(message);
  };

  return { isConnected, messages, setConnectionStatus, addMessage };
});
