import { defineStore } from "pinia";
import { io } from "socket.io-client";
import type { IMessage, ISocketState } from "@/types";

export const useSocketStore = defineStore("socket", {
  state: (): ISocketState => ({
    socket: null,
    messages: [],
    isConnected: false,
    username: null
  }),

  actions: {
    connect(token: string) {
      if (this.socket?.connected) {
        console.log("Socket already connected, skipping connection");
        return;
      }

      this.socket = io("http://localhost:3000/chat", {
        auth: {
          token
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
        transportOptions: {
          polling: {
            extraHeaders: {
              Authorization: `Bearer ${token}`
            }
          }
        }
      });

      this.setupEventListeners();
    },

    setupEventListeners() {
      if (!this.socket) {
        console.error("No socket instance available");
        return;
      }

      this.socket.on("connect", () => {
        this.isConnected = true;
      });

      this.socket.on("connect_error", (error) => {
        console.error("Socket connection error:", {
          message: error.message,
          data: error
        });

        if (error.message === "Invalid token") {
          this.disconnect();
          this.clearMessages();
        }
      });

      this.socket.on("disconnect", (reason) => {
        this.isConnected = false;
      });

      this.socket.on("new_message", (message: IMessage) => {
        this.handleNewMessage(message);
      });

      this.socket.on("error", (error) => {
        console.error("Socket general error:", error);
      });
    },

    handleNewMessage(message: IMessage) {
      this.messages.push(message);
      this.saveMessages();
    },

    sendMessage(messageText: string) {
      if (!this.isConnected || !this.socket) {
        throw new Error("Socket is not connected");
      }

      this.socket.emit("send_message", {
        message: messageText
      });
    },

    setMessages(messages: IMessage[]) {
      this.messages = messages;
      this.saveMessages();
    },

    addMessage(message: IMessage) {
      this.sendMessage(message.message);
    },

    clearMessages() {
      this.messages = [];
      this.saveMessages();
    },

    saveMessages() {
      try {
        localStorage.setItem("chat_messages", JSON.stringify(this.messages));
      } catch (error) {
        console.error("Failed to save messages to localStorage:", error);
      }
    },

    loadMessages() {
      try {
        const stored = localStorage.getItem("chat_messages");
        if (stored) {
          this.messages = JSON.parse(stored);
        }
      } catch (error) {
        console.error("Failed to load messages from localStorage:", error);
      }
    },

    disconnect() {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
      this.isConnected = false;
    }
  }
});
