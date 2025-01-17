import { ref } from "vue";
import { io, Socket } from "socket.io-client";
import { useSocketStore } from "@/stores/socket.store";
import type { IMessage } from "@/types";

export const useWebSocket = () => {
  const socket = ref<Socket | null>(null);
  const socketStore = useSocketStore();

  const connect = (token: string) => {
    if (socket.value?.connected) {
      console.log("Socket already connected, skipping connection");
      return;
    }

    socket.value = io("http://localhost:3000/chat", {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      transportOptions: {
        polling: {
          extraHeaders: {
            Authorization: `Bearer ${token}`,
          },
        },
      },
    });
  };

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
    }
    socketStore.setConnected(false);
  };

  const setupEventListeners = (onNewMessage: (message: IMessage) => void) => {
    if (!socket.value) {
      console.error("No socket instance available");
      return;
    }

    socket.value.on("connect", () => {
      socketStore.setConnected(true);
    });

    socket.value.on("connect_error", (error) => {
      console.error("Socket connection error:", {
        message: error.message,
        data: error,
      });

      if (error.message === "Invalid token") {
        disconnect();
      }
    });

    socket.value.on("disconnect", () => {
      socketStore.setConnected(false);
    });

    socket.value.on("new_message", onNewMessage);

    socket.value.on("error", (error) => {
      console.error("Socket general error:", error);
    });
  };

  const sendMessage = (messageText: string) => {
    if (!socketStore.isConnected || !socket.value) {
      throw new Error("Socket is not connected");
    }

    socket.value.emit("send_message", {
      message: messageText,
    });
  };

  return {
    connect,
    setupEventListeners,
    sendMessage,
    disconnect,
  };
};
