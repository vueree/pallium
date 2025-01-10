import { reactive } from "vue";
import { io, Socket } from "socket.io-client";
import type { WebSocketState } from "@/types";

const state = reactive<WebSocketState>({
  socket: null,
  isConnected: false
});

const setupSocketListeners = (socket: Socket) => {
  socket.on("connect", () => {
    state.isConnected = true;
    console.log("[WebSocket] Connected successfully");
  });

  socket.on("new_message", (message) => {
    console.log("[WebSocket] New message received:", message);
    // Здесь можно добавить обработку нового сообщения
    // Например, эмитить событие для обновления UI
  });

  socket.on("error", (error: any) => {
    console.error("[WebSocket] Error:", error);
  });

  socket.on("disconnect", (reason: string) => {
    state.isConnected = false;
    console.log("[WebSocket] Disconnected:", reason);

    if (reason === "io server disconnect") {
      console.log("[WebSocket] Attempting to reconnect...");
      socket.connect();
    }
  });
};

export const initializeSocket = (token: string): Socket | null => {
  if (!token) {
    console.error("[WebSocket] Token is required for initialization");
    return null;
  }

  console.log("[WebSocket] Initializing connection...");

  const socket = io("http://localhost:3000/chat", {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 4000,
    reconnectionAttempts: Infinity
  });

  setupSocketListeners(socket);
  state.socket = socket;

  return socket;
};

export const sendMessage = (message: string): void => {
  if (!state.socket || !state.isConnected) {
    console.error("[WebSocket] Cannot send message: Socket not connected");
    return;
  }

  state.socket.emit("send_message", { message });
};

export const disconnectSocket = (): void => {
  if (state.socket) {
    console.log("[WebSocket] Disconnecting socket...");
    state.socket.disconnect();
    state.socket = null;
    state.isConnected = false;
  }
};

export const getSocket = (): Socket | null => {
  return state.socket;
};

export const useSocketStatus = (): boolean => {
  return state.isConnected;
};
