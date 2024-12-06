// webSockets.store.ts
import { defineStore } from "pinia";
import { ref } from "vue";
import {
  initializeSocket,
  disconnectSocket,
  getSocket
} from "../use/useWebSocket";
import type { IMessage } from "../types";

export const useWebSocketStore = defineStore("webSocket", () => {
  const messages = ref<IMessage[]>([]);
  const isConnected = ref(false);

  const setMessages = (newMessages: IMessage[]) => {
    console.log("Setting messages in store:", newMessages);
    messages.value = newMessages;
    localStorage.setItem("chatMessages", JSON.stringify(newMessages));
  };

  const setupSocketListeners = () => {
    console.log("Setting up socket listeners");
    const socket = getSocket();

    if (socket) {
      socket.off("new_message");
      socket.off("message_history");
      socket.off("messages_cleared");

      socket.on("message_history", (content: IMessage[]) => {
        console.log("📥 Received message history:", content);
        setMessages(content);
      });

      socket.on("new_message", (content: IMessage) => {
        console.log("📥 Received new message:", content);
        messages.value = [content, ...messages.value];
        localStorage.setItem("chatMessages", JSON.stringify(messages.value));
      });

      socket.on("messages_cleared", () => {
        console.log("🗑️ Messages cleared");
        setMessages([]);
        localStorage.removeItem("chatMessages");
      });

      socket.on("error", (error: Error) => {
        console.error("🔴 Socket error in store:", error);
      });
    } else {
      console.warn("⚠️ Cannot setup listeners: socket is null");
    }
  };

  const connect = (token: string | undefined) => {
    console.log(
      "Connecting to WebSocket with token:",
      token?.substring(0, 10) + "..."
    );

    if (!token) {
      console.error("🔴 Token is required for WebSocket connection");
      return;
    }

    const socket = initializeSocket(token);

    if (socket) {
      socket.on("connect", () => {
        console.log("🟢 WebSocket connected in store");
        isConnected.value = true;
        setupSocketListeners();
      });

      socket.on("disconnect", () => {
        console.log("🔴 WebSocket disconnected in store");
        isConnected.value = false;
      });
    } else {
      console.error("🔴 Failed to initialize socket");
    }
  };

  const sendMessage = (messageData: { message: string; username: string }) => {
    console.log("📤 Attempting to send message:", messageData);
    const socket = getSocket();

    if (socket?.connected) {
      console.log("📤 Emitting message");
      socket.emit("send_message", messageData);
    } else {
      console.error("🔴 Cannot send message: socket not connected");
    }
  };

  const disconnect = () => {
    console.log("Disconnecting WebSocket");
    disconnectSocket();
    isConnected.value = false;
  };

  return {
    messages,
    isConnected,
    connect,
    disconnect,
    sendMessage,
    getSocket,
    setMessages
  };
});
