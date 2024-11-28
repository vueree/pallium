import { ref } from "vue";
import { io, Socket } from "socket.io-client";
import type { IMessage } from "../types";

const socket = ref<Socket | null>(null);
const isConnected = ref(false);

export const initializeSocket = (token: string) => {
  socket.value = io("http://localhost:3000/chat", {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 2000,
    reconnectionAttempts: Infinity
  });

  socket.value.on("connect", () => {
    console.log("WebSocket connected");
    isConnected.value = true;
  });

  socket.value.on("disconnect", (reason) => {
    console.log("WebSocket disconnected:", reason);
    isConnected.value = false;
    if (reason === "io server disconnect") {
      socket.value?.connect();
    }
  });

  socket.value.on("error", (error) => {
    console.error("WebSocket error:", error);
  });

  socket.value.on("new_message", (message: IMessage) => {
    console.log("Received new message:", message);
  });
};

export const disconnectSocket = () => {
  if (socket.value) {
    socket.value.disconnect();
    socket.value = null;
    isConnected.value = false;
  }
};

export const getSocket = (): Socket | null => socket.value;

export const useSocketStatus = () => isConnected;
