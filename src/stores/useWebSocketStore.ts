import { defineStore } from "pinia";
import { ref } from "vue";

export const useWebSocketStore = defineStore("webSocket", () => {
  const isConnected = ref(false);

  const setConnectionStatus = (status: boolean) => {
    isConnected.value = status;
  };

  return { isConnected, setConnectionStatus };
});
