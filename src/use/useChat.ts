import { ref } from "vue";
import type { IMessage } from "@/types";

const API_BASE_URL = "http://localhost:3000";

export function useChat() {
  const messagesRef = ref<IMessage[]>([]);
  const encryptionKeyRef = ref("");

  const getChatHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/getMessages`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched messages:", data);
      messagesRef.value = data.map((message: IMessage) => ({
        ...message,
        text: message.text
          ? xorEncryptDecrypt(message.text, encryptionKeyRef.value)
          : ""
      }));
      return messagesRef.value;
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  };

  const clearChatHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/clearMessages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ cleaning: true })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        console.log("Chat history cleared successfully");
        messagesRef.value = [];
        return true;
      } else {
        console.error("Failed to clear chat history:", data.message);
        return false;
      }
    } catch (error) {
      console.error("Error clearing chat history:", error);
      throw error;
    }
  };

  const setEncryptionKey = (key: string) => {
    encryptionKeyRef.value = key;
  };

  function xorEncryptDecrypt(input: string, key: string): string {
    if (!input || !key) return ""; // Проверка на пустые значения
    let output = "";
    for (let i = 0; i < input.length; i++) {
      output += String.fromCharCode(
        input.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return output;
  }

  return {
    getChatHistory,
    clearChatHistory,
    setEncryptionKey,
    messages: messagesRef,
    encryptionKey: encryptionKeyRef
  };
}
