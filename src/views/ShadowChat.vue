<script setup lang="ts">
import { ref, onMounted, watch, nextTick, onUnmounted } from "vue";
import InputBase from "@/components/atom/InputBase.vue";
import BtnBase from "@/components/atom/BtnBase.vue";
import { useWebSocketStore } from "@/stores/useWebSocketStore";
import type { IMessage } from "@/types";

const chatInputRef = ref("");
const messagesRef = ref<IMessage[]>([]);
const chatAreaRef = ref<HTMLElement | null>(null);
const socketRef = ref<WebSocket | null>(null);
const usernameRef = ref("User" + Math.floor(Math.random() * 1000));
const isConnectedRef = ref(false);

const webSocketStore = useWebSocketStore(); // Используем store

const scrollToBottom = () => {
  nextTick(() => {
    if (chatAreaRef.value) {
      chatAreaRef.value.scrollTop = chatAreaRef.value.scrollHeight;
    }
  });
};

const connectWebSocket = () => {
  socketRef.value = new WebSocket("ws://localhost:3000");

  socketRef.value.onopen = () => {
    isConnectedRef.value = true;
    webSocketStore.setConnectionStatus(true);
  };

  socketRef.value.onmessage = (event) => {
    const newMessage: IMessage = JSON.parse(event.data);
    messagesRef.value.push(newMessage);
    scrollToBottom();
  };

  socketRef.value.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  socketRef.value.onclose = () => {
    webSocketStore.setConnectionStatus(false);
    isConnectedRef.value = false;
  };
};

const reloadWebSocket = () => {
  if (socketRef.value) {
    socketRef.value.close();
  }
  connectWebSocket();
};

const sendMessage = () => {
  if (chatInputRef.value.trim() && socketRef.value && isConnectedRef.value) {
    const newMessage: IMessage = {
      id: Date.now(),
      text: chatInputRef.value,
      user: usernameRef.value,
      timestamp: new Date().toISOString()
    };
    socketRef.value.send(JSON.stringify(newMessage));
    chatInputRef.value = "";
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
};

const getChatHistory = async () => {
  try {
    const response = await fetch("http://localhost:3000/getMessages");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Fetched messages:", data);
    messagesRef.value = data;
    scrollToBottom();
  } catch (error) {
    console.error("Error fetching messages:", error);
  }
};

const clearChatHistory = async () => {
  try {
    const response = await fetch("http://localhost:3000/clearMessages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ cleaning: true }) // Отправляем поле cleaning: true
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.success) {
      console.log("Chat history cleared successfully");
      messagesRef.value = []; // Очищаем сообщения на фронте
    } else {
      console.error("Failed to clear chat history:", data.message);
    }
  } catch (error) {
    console.error("Error clearing chat history:", error);
  }
};

const removeChat = () => {
  messagesRef.value = [];
  clearChatHistory();
};

onMounted(() => {
  connectWebSocket();
  getChatHistory();
});

onUnmounted(() => {
  if (socketRef.value) {
    console.log("Closing WebSocket connection");
    socketRef.value.close();
  }
});

watch(
  messagesRef,
  (newMessages) => {
    console.log("Messages updated:", newMessages);
    scrollToBottom();
  },
  { deep: true }
);
</script>

<template>
  <main
    :class="[
      $style.wrapper,
      'flex flex-column w-full h-full mx-auto max-width'
    ]"
  >
    <BtnBase
      :class="$style['button-remove']"
      label="Clear"
      @click="removeChat"
    />
    <!-- <div>
      <span>WebSockets:</span>
      <span :class="isConnectedRef ? 'cl_green' : 'cl_red'">{{
        isConnectedRef ? "Connected" : "Disconnected"
      }}</span>
    </div> -->
    <div>
      <BtnBase
        label="Reconnect WebSocket"
        @click="reloadWebSocket"
        :class="$style['button-reconnect']"
      />
    </div>
    <div
      :class="[$style.chatArea, 'flex flex-column w-full']"
      ref="chatAreaRef"
    >
      <div
        v-for="message in messagesRef"
        :key="message.id"
        :class="[
          $style.message,
          message.user === usernameRef ? $style.ownMessage : ''
        ]"
      >
        <span :class="$style.messageUser">{{ message.user }}</span>
        <span :class="$style.messageText">{{ message.text }}</span>
        <span :class="$style.messageTime">{{
          new Date(message.timestamp).toLocaleTimeString()
        }}</span>
      </div>
    </div>
    <div :class="[$style.inputArea, 'flex']">
      <InputBase
        v-model="chatInputRef"
        class="w-full"
        type="text"
        placeholder="Введите сообщение..."
        width="1200px"
        @keydown="handleKeydown"
      >
        <BtnBase @click="sendMessage" label="Send" />
      </InputBase>
    </div>
  </main>
</template>

<style module>
.wrapper {
  position: relative;
  height: calc(100vh - 120px);
}

.chatArea {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px 0;
}

.message {
  padding: 8px;
  margin-bottom: 8px;
  border-radius: 8px;
  background-color: #f0f0f0;
  align-self: flex-start;
  max-width: 70%;
}

.ownMessage {
  align-self: flex-end;
  background-color: #dcf8c6;
}

.messageUser {
  font-weight: bold;
  margin-right: 8px;
}

.messageText {
  display: block;
}

.messageTime {
  font-size: 0.8em;
  color: #888;
  display: block;
  text-align: right;
}

.inputArea {
  margin-top: auto;
}

.button-remove {
  position: absolute;
  right: -200px;
  top: -50px;
}

.button-reconnect {
  margin: 10px; /* Отступ между кнопками */
  background-color: #007bff; /* Цвет фона кнопки */
  color: white; /* Цвет текста */
  border: none; /* Убираем обводку */
  padding: 10px 15px; /* Отступы внутри кнопки */
  border-radius: 5px; /* Закругленные углы */
  cursor: pointer; /* Указатель при наведении */
  transition: background-color 0.3s; /* Анимация при наведении */
}
</style>
