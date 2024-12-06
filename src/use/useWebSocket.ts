import { reactive } from "vue";
import { io, Socket } from "socket.io-client";

const state = reactive<{
  socket: Socket | null;
  isConnected: boolean;
}>({
  socket: null,
  isConnected: false
});

export const initializeSocket = (token: string) => {
  console.log("Initializing socket with token:", token);

  state.socket = io("https://api-pallium.onrender.com/chat", {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 4000,
    reconnectionAttempts: Infinity
  });

  state.socket.on("connect", () => {
    console.log("🟢 WebSocket connected successfully");
    state.isConnected = true;
  });

  state.socket.on("connect_error", (error) => {
    console.error("🔴 Connection error:", error.message);
  });

  state.socket.on("disconnect", (reason) => {
    console.log("🔴 WebSocket disconnected:", reason);
    state.isConnected = false;
    if (reason === "io server disconnect") {
      console.log("Attempting to reconnect...");
      state.socket?.connect();
    }
  });

  state.socket.on("error", (error) => {
    console.error("🔴 WebSocket error:", error);
  });

  return state.socket;
};

export const disconnectSocket = () => {
  console.log("Manually disconnecting socket");
  state.socket?.disconnect();
  state.socket = null;
  state.isConnected = false;
};

export const getSocket = (): Socket | null => {
  console.log("Getting socket, connected:", state.isConnected);
  return state.socket;
};

export const useSocketStatus = () => state.isConnected;
