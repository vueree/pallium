<script setup lang="ts">
import { ref, onMounted, watch, nextTick, onUnmounted } from "vue";
import InputBase from "@/components/atom/InputBase.vue";
import BtnBase from "@/components/atom/BtnBase.vue";
import { useWebSocketStore } from "@/stores/useWebSocketStore";
import type { IMessage } from "@/types";
import { fetchGetMessages } from "@/use/fetchChat";

const chatInputRef = ref("");
const chatAreaRef = ref<HTMLElement | null>(null);
const socketRef = ref<WebSocket | null>(null);
const isConnectedRef = ref(false);
const messagesRef = ref<IMessage[]>([]);
const usernameRef = ref("");

const webSocketStore = useWebSocketStore();

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

const clearChatHistory = async () => {
  try {
    const response = await fetch("http://localhost:3000/clearMessages", {
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
      messagesRef.value = []; // Clear messages on the front end
    } else {
      console.error("Failed to clear chat history:", data.message);
    }
  } catch (error) {
    console.error("Error clearing chat history:", error);
  }
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

const removeChat = () => {
  messagesRef.value = [];
  clearChatHistory();
};

onMounted(() => {
  connectWebSocket();
  fetchGetMessages();
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
  <main :class="[$style.wrapper, 'flex flex-column w-full h-full']">
    <BtnBase
      v-show="messagesRef.length > 0"
      :class="[$style['button-remove'], 'absolute']"
      targetButton="CleanChat"
      @click="removeChat"
    />
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
  top: -50px;
  right: 0;
  opacity: 50%;
}
</style>
