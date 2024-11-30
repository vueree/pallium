import { reactive } from "vue";
import { io, Socket } from "socket.io-client";
import type { IMessage } from "../types";

const state = reactive<{
  socket: Socket | null;
  isConnected: boolean;
}>({
  socket: null,
  isConnected: false
});

export const initializeSocket = (token: string) => {
  state.socket = io("http://localhost:3000/chat", {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 2000,
    reconnectionAttempts: Infinity
  });

  state.socket.on("connect", () => {
    console.log("WebSocket connected");
    state.isConnected = true;
  });

  state.socket.on("disconnect", (reason) => {
    console.log("WebSocket disconnected:", reason);
    state.isConnected = false;
    if (reason === "io server disconnect") {
      state.socket?.connect();
    }
  });

  state.socket.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
};

export const disconnectSocket = () => {
  state.socket?.disconnect();
  state.socket = null;
  state.isConnected = false;
};

export const getSocket = (): Socket | null => state.socket;

export const useSocketStatus = () => state.isConnected;
