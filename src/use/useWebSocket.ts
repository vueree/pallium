import { reactive, Reactive } from "vue";
import { io, Socket } from "socket.io-client";

interface WebSocketState {
  socket: Socket | null;
  isConnected: boolean;
}

const state: Reactive<WebSocketState> = reactive({
  socket: null,
  isConnected: false
});

export const initializeSocket = (token: string): Socket | null => {
  console.log("Initializing socket with token:", token);

  // const socket = io("https://api-pallium.onrender.com/chat", {
  const socket = io("http://localhost:3000/chat", {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 4000,
    reconnectionAttempts: Infinity
  });

  socket.on("connect", () => {
    console.log(" WebSocket connected successfully");
    state.isConnected = true;
  });

  socket.on("connect_error", (error) => {
    console.error(" Connection error:", error.message);
  });

  socket.on("disconnect", (reason) => {
    console.log(" WebSocket disconnected:", reason);
    state.isConnected = false;
    if (reason === "io server disconnect") {
      console.log("Attempting to reconnect...");
      socket.connect();
    }
  });

  socket.on("error", (error) => {
    console.error(" WebSocket error:", error);
  });

  state.socket = socket;
  return socket;
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
