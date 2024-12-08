<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import BtnBase from "@/components/atom/BtnBase.vue";
import { clearMessages, getMessages, token, getUsername } from "@/use/useChat";
import { useWebSocketStore } from "@/stores/webSockets.store";
import { getSocket } from "@/use/useWebSocket";

const chatInputRef = ref("");
const usernameRef = ref(getUsername());
const chatAreaRef = ref<HTMLElement | null>(null);

const webSocketStore = useWebSocketStore();
const { messages, isConnected } = storeToRefs(webSocketStore);

const router = useRouter();

const currentPage = ref(1);
const totalPages = ref();
const messagesPerPage = 20; // Количество сообщений на страницу
const loading = ref(false); // Флаг загрузки сообщений

// Загрузка сообщений
const loadMessages = async () => {
  loading.value = true;
  const responseTotalPages = await getMessages(
    currentPage.value,
    messagesPerPage
  );
  totalPages.value = responseTotalPages;
  loading.value = false;
};

const requestMessageHistory = (page: number, messagesPerPage: number) => {
  const socket = getSocket();

  if (socket?.connected) {
    socket.emit("get_message_history", { page, messagesPerPage });
  } else {
    console.error("🔴 Cannot request message history: socket not connected");
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (chatAreaRef.value) {
      chatAreaRef.value.scrollTop = chatAreaRef.value.scrollHeight;
    }
  });
};

const handleScroll = async () => {
  if (!chatAreaRef.value) return;

  if (chatAreaRef.value.scrollTop === 0) {
    if (currentPage.value < totalPages.value) {
      currentPage.value += 1;
      requestMessageHistory(currentPage.value, messagesPerPage);
    }
  }
};

const removeChat = async () => {
  if (token) {
    await clearMessages();
    webSocketStore.messages = [];
  }
};

const sendMessage = () => {
  if (!isConnected.value) {
    console.error("WebSocket is not connected");
    return;
  }

  const messageText = chatInputRef.value.trim();
  if (!messageText) {
    console.warn("Cannot send empty message");
    return;
  }

  webSocketStore.sendMessage({
    message: messageText,
    username: usernameRef.value
  });

  chatInputRef.value = "";
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
};

onMounted(async () => {
  if (!token) {
    router.push({ name: "Login" });
    return;
  }

  webSocketStore.connect(token);
  await loadMessages();
  scrollToBottom();
});

onUnmounted(() => {
  webSocketStore.disconnect();
});

watch(messages, scrollToBottom, { deep: true });
</script>

<template>
  <main class="flex flex-column justify-between h-full max-width">
    <BtnBase
      v-show="messages.length"
      :btnClass="[$style['button-remove'], 'absolute']"
      label="Clear"
      @click="removeChat"
    />
    <div
      ref="chatAreaRef"
      :class="[$style['chat-area'], 'flex flex-column w-full ']"
      @scroll="handleScroll"
    >
      <div
        v-for="(message, index) in messages"
        :key="`${message.timestamp}-${index}`"
        :class="[
          $style.message,
          message.username === usernameRef ? $style['own-message'] : ''
        ]"
      >
        <span :class="$style['message-user']">
          {{ message.username || "Anonymous" }}
        </span>
        <span class="display-block">{{ message.message }}</span>
        <span :class="[$style['message-time'], 'display-block']">
          {{ new Date(message.timestamp).toLocaleTimeString() }}
        </span>
      </div>
      <div v-if="loading" class="loading-indicator">Loading...</div>
    </div>

    <div
      :class="[$style['input-area'], 'flex gap-12 items-center mx-auto w-full']"
    >
      <textarea
        v-model="chatInputRef"
        :class="[$style['text-area'], 'rounded-10 w-full']"
        placeholder="Enter your message..."
        rows="3"
        spellcheck="true"
        @keydown="handleKeydown"
      />
      <BtnBase
        :btnClass="$style['button-send']"
        label="Send"
        :disabled="!isConnected"
        @click="sendMessage"
      />
    </div>
  </main>
</template>

<style module>
.chat-area {
  overflow-y: auto;
}

.loading-indicator {
  text-align: center;
  margin: 10px 0;
}

.message {
  padding: 8px;
  border-radius: 8px;
  background-color: #f0f0f0;
  align-self: flex-start;
  margin-top: 12px;
  margin-bottom: 12px;
}

.own-message {
  align-self: flex-end;
  background-color: #dcf8c6;
}

.message-user {
  font-weight: bold;
}

.message-time {
  font-size: 0.8em;
  color: #888;
  text-align: right;
}

.text-area {
  border: 1px solid rgba(173, 180, 230, 0.5);
  resize: none;
  padding: 8px 12px;
}

.input-area {
  margin-bottom: 8px;
  margin-top: 8px;
}

.button-remove {
  top: 70px;
  right: 50px;
  opacity: 0.1;
}

.button-remove,
.button-send {
  max-width: 80px;
}
</style>
