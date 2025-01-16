import { defineStore } from "pinia";

interface SocketState {
  isConnected: boolean;
}

export const useSocketStore = defineStore("socket", {
  state: (): SocketState => ({
    isConnected: false
  }),

  actions: {
    setConnected(status: boolean) {
      this.isConnected = status;
    }
  }
});