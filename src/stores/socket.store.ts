import { defineStore } from "pinia";
import type { SocketStatus } from "@/types";

export const useSocketStore = defineStore("socket", {
  state: (): SocketStatus => ({
    isConnected: false,
  }),

  actions: {
    setConnected(status: boolean) {
      this.isConnected = status;
    },
  },
});
