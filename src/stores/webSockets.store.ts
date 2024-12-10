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
  const currentPage = ref(1);
  const totalPages = ref(0);

  const connect = (token: string | undefined): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!token) {
        console.error(" Token is required for WebSocket connection");
        reject();
        return;
      }

      const socket = initializeSocket(token);

      if (socket) {
        socket.on("connect", () => {
          isConnected.value = true;
          console.log("WebSocket connected");
          setupSocketListeners();
          resolve();
        });

        socket.on("disconnect", () => {
          isConnected.value = false;
          console.log("WebSocket disconnected");
        });
      } else {
        console.error(" Failed to initialize socket");
        reject();
      }
    });
  };

  const disconnect = () => {
    const socket = getSocket();
    if (socket) {
      disconnectSocket();
      isConnected.value = false;
      messages.value = [];
      console.log("WebSocket disconnected manually");
    }
  };

  const fetchMessageHistory = (page, perPage) => {
    console.log(`[FRONT] Fetching message history:`, { page, perPage });

    const socket = getSocket();
    if (socket && socket.connected) {
      console.log(`[FRONT] Socket connected, emitting message_history`);

      socket.emit("message_history", { page, perPage }, (response) => {
        console.log(`[FRONT] Message history response:`, response);

        if (response.success) {
          if (page > currentPage.value) {
            console.log(`[FRONT] Appending messages for page ${page}`);
            messages.value.push(...response.messages);
          } else {
            console.log(`[FRONT] Replacing messages for page ${page}`);
            messages.value = response.messages;
          }

          currentPage.value = page;
          totalPages.value = response.totalPages;

          console.log(`[FRONT] Updated state:`, {
            currentPage: currentPage.value,
            totalPages: totalPages.value,
            messagesCount: messages.value.length
          });
        } else {
          console.error(`[FRONT] Failed to fetch messages:`, response.error);
        }
      });
    } else {
      console.error(
        "[FRONT] Cannot fetch message history: socket not connected"
      );
    }
  };

  const setMessages = (newMessages: IMessage[]) => {
    messages.value = newMessages;
  };

  const setupSocketListeners = () => {
    const socket = getSocket();

    if (socket) {
      socket.off("new_message");
      socket.off("message_history");
      socket.off("messages_cleared");

      socket.on("message_history", (data) => {
        if (data.success) {
          console.log(
            `Received page ${data.page}, total pages now: ${data.totalPages}`
          );

          if (data.page > currentPage.value) {
            data.messages.forEach((message: any) =>
              messages.value.push(message)
            );
          } else if (data.page === 1) {
            messages.value = data.messages;
          }
          // currentPage.value = data.page;
          totalPages.value = data.totalPages;
        } else {
          console.error("Failed to fetch message history:", data.error);
        }
      });

      socket.on("new_message", (content: IMessage) => {
        messages.value.push(content);
      });

      socket.on("messages_cleared", () => {
        setMessages([]);
      });

      socket.on("error", (error: Error) => {
        console.error(" Socket error in store:", error);
      });
    }
  };

  const sendMessage = (messageData: { message: string; username: string }) => {
    const socket = getSocket();

    if (socket?.connected) {
      socket.emit("send_message", messageData);
    } else {
      console.error(" Cannot send message: socket not connected");
    }
  };

  return {
    messages,
    isConnected,
    currentPage,
    totalPages,
    connect,
    disconnect,
    sendMessage,
    fetchMessageHistory,
    setMessages
  };
});
