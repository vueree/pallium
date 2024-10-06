<script setup lang="ts">
import { ref, onMounted, watch, nextTick, onUnmounted } from "vue";
import { io, Socket } from "socket.io-client";
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
const socket = ref<Socket | null>(null);
const username = ref("User" + Math.floor(Math.random() * 1000));

const scrollToBottom = () => {
  nextTick(() => {
    if (chatAreaRef.value) {
      chatAreaRef.value.scrollTop = chatAreaRef.value.scrollHeight;
    }
  });
};

const connectSocket = () => {
  console.log("Attempting to connect to server...");
  socket.value = io("http://localhost:5173", { transports: ["websocket"] });

  socket.value.on("connect", () => {
    console.log("Connected to server");
  });

  socket.value.on("connect_error", (error) => {
    console.error("Connection error:", error);
  });

  socket.value.on("chat history", (history: IMessage[]) => {
    console.log("Received chat history:", history);
    messages.value = history;
    scrollToBottom();
  });

  socket.value.on("chat message", (message: IMessage) => {
    console.log("Received new message:", message);
    messages.value.push(message);
    scrollToBottom();
  });
};

const sendMessage = () => {
  if (chatInput.value.trim() && socket.value) {
    const newMessage = {
      text: chatInput.value,
      user: username.value
    };
    console.log("Sending message:", newMessage);
    socket.value.emit("chat message", newMessage);
    chatInput.value = "";
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
};

onMounted(() => {
  connectSocket();
});

onUnmounted(() => {
  if (socket.value) {
    console.log("Disconnecting from server");
    socket.value.disconnect();
  }
});

watch(messages, scrollToBottom, { deep: true });
</script>

<template>
  <main
    :class="[
      $style.wrapper,
      'flex flex-column w-full h-full mx-auto max-width'
    ]"
  >
    <BtnBase :class="$style['button-remove']" label="" @click="removeChat" />
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
        <BtnBase @click="sendMessage" />
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
