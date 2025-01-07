import { reactive } from "vue";
import { io, Socket } from "socket.io-client";
import type { WebSocketState } from "../types";

const state = reactive<WebSocketState>({
  socket: null,
  isConnected: false
});

const setupSocketListeners = (socket: Socket) => {
  socket.on("connect", () => {
    state.isConnected = true;
    console.log("[WebSocket] Connected successfully");
  });

  socket.on("disconnect", (reason: string) => {
    state.isConnected = false;
    console.log("[WebSocket] Disconnected", { reason });

    if (reason === "io server disconnect") {
      console.log("[WebSocket] Attempting to reconnect...");
      socket.connect(); // Пытаемся переподключиться
    }
  });

  socket.on("error", (error: any) => {
    console.error("[WebSocket] Error", error);
  });
};

export const initializeSocket = (token: string): Socket | null => {
  if (!token) {
    console.error("[WebSocket] Token is required for initialization");
    return null;
  }

  console.log("[WebSocket] Initializing connection with token:", token);

  const socket = io("http://localhost:3000/chat", {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 4000,
    reconnectionAttempts: Infinity
  });

  setupSocketListeners(socket);
  state.socket = socket;

  // Логируем состояние соединения после установки слушателей
  console.log("[WebSocket] Attempting to connect...");
  return socket;
};

export const disconnectSocket = (): void => {
  if (state.socket) {
    console.log("[WebSocket] Disconnecting socket...");
    state.socket.disconnect();
    state.socket = null;
    state.isConnected = false;
    console.log("[WebSocket] Socket disconnected");
  }
};

export const getSocket = (): Socket | null => {
  return state.socket as Socket | null;
};

export const useSocketStatus = (): boolean => {
  console.log("[WebSocket] Current connection status:", state.isConnected);
  return state.isConnected;
};
