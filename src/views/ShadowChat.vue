<script setup lang="ts">
import { ref, onMounted, watch, nextTick, onUnmounted } from "vue";
import InputBase from "@/components/atom/InputBase.vue";
import BtnBase from "@/components/atom/BtnBase.vue";

interface IMessage {
  id: number;
  text: string;
  user: string;
  timestamp: Date;
}

const chatInput = ref("");
const messages = ref<IMessage[]>([]);
const chatAreaRef = ref<HTMLElement | null>(null);
const socket = ref<WebSocket | null>(null);
const username = ref("User" + Math.floor(Math.random() * 1000));
const isConnected = ref(false);
const connectionAttempts = ref(0);

const scrollToBottom = () => {
  nextTick(() => {
    if (chatAreaRef.value) {
      chatAreaRef.value.scrollTop = chatAreaRef.value.scrollHeight;
    }
  });
};

const connectWebSocket = () => {
  connectionAttempts.value++;
  console.log(
    `Attempting to connect to server... (Attempt ${connectionAttempts.value})`
  );
  socket.value = new WebSocket("ws://localhost:5173");

  socket.value.onopen = () => {
    console.log("Connected to server");
    isConnected.value = true;
    connectionAttempts.value = 0;
  };

  socket.value.onmessage = (event) => {
    console.log("Received message from server:", event.data);
    try {
      const data = JSON.parse(event.data);
      if (data.type === "chat history") {
        console.log("Received chat history:", data.messages);
        messages.value = data.messages;
      } else if (data.type === "chat message") {
        console.log("Received new message:", data.message);
        messages.value.push(data.message);
      }
      scrollToBottom();
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  };

  socket.value.onerror = (error) => {
    console.error("WebSocket error:", error);
    isConnected.value = false;
  };

  socket.value.onclose = (event) => {
    console.log("WebSocket connection closed:", event.code, event.reason);
    isConnected.value = false;
    if (connectionAttempts.value < 5) {
      setTimeout(connectWebSocket, 5000);
    } else {
      console.log(
        "Max reconnection attempts reached. Please refresh the page."
      );
    }
  };
};

const sendMessage = () => {
  console.log("Attempting to send message");
  if (chatInput.value.trim() && socket.value && isConnected.value) {
    console.log("Message is not empty and socket is connected");
    const newMessage = {
      text: chatInput.value,
      user: username.value
    };
    console.log("Sending message:", newMessage);
    socket.value.send(
      JSON.stringify({ type: "chat message", message: newMessage })
    );

    // Добавляем сообщение локально перед отправкой на сервер
    const localMessage = {
      id: Date.now(),
      ...newMessage,
      timestamp: new Date()
    };
    messages.value.push(localMessage);
    console.log("Added local message:", localMessage);

    chatInput.value = "";
    scrollToBottom();
  } else {
    console.log(
      "Cannot send message. Connected:",
      isConnected.value,
      "Socket exists:",
      !!socket.value
    );
    if (!isConnected.value) {
      console.log("Attempting to reconnect...");
      connectWebSocket();
    }
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

onMounted(() => {
  connectWebSocket();
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
      label="Clear Chat"
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
  right: 0;
  top: 10px;
}
</style>
