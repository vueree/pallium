import { ref } from "vue";
import type { Ref } from "vue";
import { useWebSocketStore } from "@/stores/useWebSocketStore";
import type { IMessage, IWebSocketOptions } from "@/types";

function xorEncryptDecrypt(input: string, key: string): string {
  let output = "";
  for (let i = 0; i < input.length; i++) {
    output += String.fromCharCode(
      input.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return output;
}

export function useWebSocket(options: IWebSocketOptions) {
  const socketRef: Ref<WebSocket | null> = ref(null);
  const isConnectedRef = ref(false);
  const reconnectIntervalRef: Ref<ReturnType<typeof setInterval> | null> =
    ref(null);
  const reconnectAttemptsRef = ref(0);
  const encryptionKeyRef: Ref<string> = ref("");

  const webSocketStore = useWebSocketStore();

  const connectWebSocket = () => {
    if (socketRef.value && socketRef.value.readyState === WebSocket.OPEN) {
      return;
    }

    socketRef.value = new WebSocket(options.url);

    socketRef.value.onopen = () => {
      isConnectedRef.value = true;
      webSocketStore.setConnectionStatus(true);
      console.log("WebSocket соединение установлено");
      if (reconnectIntervalRef.value) {
        clearInterval(reconnectIntervalRef.value);
        reconnectIntervalRef.value = null;
      }
      reconnectAttemptsRef.value = 0;
    };

    socketRef.value.onmessage = (event) => {
      const encryptedMessage: IMessage = JSON.parse(event.data);
      const decryptedMessage: IMessage = {
        ...encryptedMessage,
        text: xorEncryptDecrypt(encryptedMessage.text, encryptionKeyRef.value)
      };
      if (options.onMessage) {
        options.onMessage(decryptedMessage);
      }
    };

    socketRef.value.onerror = (error) => {
      console.error("WebSocket ошибка:", error);
      if (options.onError) {
        options.onError(error);
      }
    };

    socketRef.value.onclose = (event) => {
      webSocketStore.setConnectionStatus(false);
      isConnectedRef.value = false;
      console.log("WebSocket соединение закрыто. Попытка переподключения...");
      if (options.onClose) {
        options.onClose();
      }
      reconnect();
    };
  };

  const reconnect = () => {
    if (!reconnectIntervalRef.value) {
      const interval = Math.min(5000 * 2 ** reconnectAttemptsRef.value, 30000); // Ограничить до 30 секунд
      reconnectIntervalRef.value = setInterval(() => {
        console.log("Попытка переподключения...");
        connectWebSocket();
        reconnectAttemptsRef.value++;
      }, interval);
    }
  };

  const sendMessage = (message: IMessage) => {
    if (socketRef.value && isConnectedRef.value) {
      const encryptedMessage: IMessage = {
        ...message,
        text: xorEncryptDecrypt(message.text, encryptionKeyRef.value)
      };
      socketRef.value.send(JSON.stringify(encryptedMessage));
    }
  };

  const closeConnection = () => {
    if (socketRef.value) {
      socketRef.value.close();
    }
    if (reconnectIntervalRef.value) {
      clearInterval(reconnectIntervalRef.value);
    }
  };

  const setEncryptionKey = (key: string) => {
    encryptionKeyRef.value = key;
  };

  return {
    connectWebSocket,
    sendMessage,
    closeConnection,
    isConnected: isConnectedRef,
    setEncryptionKey
  };
}
