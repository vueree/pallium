<script setup lang="ts">
import { ref, onMounted, watch, nextTick, onUnmounted } from "vue";
import InputBase from "@/components/atom/InputBase.vue";
import BtnBase from "@/components/atom/BtnBase.vue";

interface IMessage {
  id: number;
  text: string;
  user: string;
  timestamp: string; // Изменено на string
}

const chatInput = ref("");
const messages = ref<IMessage[]>([]);
const chatAreaRef = ref<HTMLElement | null>(null);
const socket = ref<WebSocket | null>(null);
const username = ref("User" + Math.floor(Math.random() * 1000));
const isConnected = ref(false);

const scrollToBottom = () => {
  nextTick(() => {
    if (chatAreaRef.value) {
      chatAreaRef.value.scrollTop = chatAreaRef.value.scrollHeight;
    }
  });
};

const connectWebSocket = () => {
  socket.value = new WebSocket("ws://localhost:3000");

  socket.value.onopen = () => {
    console.log("WebSocket connection established");
    isConnected.value = true;
  };

  socket.value.onmessage = (event) => {
    const newMessage: IMessage = JSON.parse(event.data);
    messages.value.push(newMessage); // Add the new message to the messages array
    scrollToBottom(); // Scroll to the bottom when a new message arrives
  };

  socket.value.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  socket.value.onclose = () => {
    console.log("WebSocket connection closed");
    isConnected.value = false;
  };
};

const sendMessage = () => {
  if (chatInput.value.trim() && socket.value && isConnected.value) {
    const newMessage: IMessage = {
      id: Date.now(), // Используем временную метку как ID
      text: chatInput.value,
      user: username.value,
      timestamp: new Date().toISOString() // Используем ISO формат для временной метки
    };
    socket.value.send(JSON.stringify(newMessage));
    chatInput.value = ""; // Очищаем инпут после отправки
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
};

const removeChat = () => {
  messages.value = [];
  console.log("Chat cleared");
};

const fetchChatHistory = async () => {
  try {
    const response = await fetch("http://localhost:3000/messages");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Fetched messages:", data);
    messages.value = data; // Обновляем массив сообщений
    scrollToBottom();
  } catch (error) {
    console.error("Error fetching messages:", error);
  }
};

onMounted(() => {
  connectWebSocket();
  fetchChatHistory(); // Fetch chat history after connecting
});

onUnmounted(() => {
  if (socket.value) {
    console.log("Closing WebSocket connection");
    socket.value.close();
  }
});

watch(
  messages,
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
    <div>
      Connection status: {{ isConnected ? "Connected" : "Disconnected" }}
    </div>
    <div
      :class="[$style.chatArea, 'flex flex-column w-full']"
      ref="chatAreaRef"
    >
      <div
        v-for="message in messages"
        :key="message.id"
        :class="[
          $style.message,
          message.user === username ? $style.ownMessage : ''
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
        v-model="chatInput"
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
  right: -120px;
  top: 44px;
}
</style>
