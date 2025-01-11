<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import BtnBase from "@/components/atom/BtnBase.vue";
import LazyInfiniteLoader from "@/components/atom/InfiniteLoader.vue";
import { useChat } from "@/composables/useChat";

const router = useRouter();
const chatAreaRef = ref<HTMLElement | null>(null);
const chatInputRef = ref("");
const loaderRef = ref<HTMLElement | null>(null);

const chat = useChat();

const {
  messages,
  isConnected,
  username,
  currentPage,
  totalPages,
  loading,
  clearMessages,
  loadMoreMessages,
  handleMessageSend,
  setupWebSocket
} = chat;

const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    handleSendMessage();
  }
};

const handleSendMessage = () => {
  handleMessageSend(chatInputRef.value, () => {
    chatInputRef.value = "";
  });
};

onMounted(() => {
  const token = localStorage.getItem("auth_token");
  if (!token) {
    nextTick(() => {
      router.push({ name: "Login" });
    });
    return;
  }

  setupWebSocket();
});

onUnmounted(() => {
  const { disconnect } = useChat();
  if (disconnect) {
    disconnect();
  }
});

watch(
  messages,
  () => {
    nextTick(() => {
      chatAreaRef.value?.scrollTo({ top: chatAreaRef.value.scrollHeight });
    });
  },
  { deep: true }
);
</script>

<template>
  <main class="flex flex-column justify-between h-full max-width">
    <BtnBase
      v-if="messages && messages.length > 0"
      :btnClass="[$style['button-remove'], 'absolute']"
      label="Clear"
      @click="clearMessages"
    />

    <div
      ref="chatAreaRef"
      :class="[$style['chat-area'], 'flex flex-column w-full']"
    >
      <LazyInfiniteLoader
        ref="loaderRef"
        v-if="totalPages > 1"
        :isFetching="loading"
        :currentPage="currentPage"
        :lastPage="totalPages"
        :distance="100"
        @fetch="loadMoreMessages"
      />

      <div
        v-for="(message, index) in messages"
        :key="`${message.timestamp}-${index}`"
        :class="[
          $style.message,
          message.username === username ? $style['own-message'] : ''
        ]"
      >
        <span :class="$style['message-user']">{{
          message.username || "Anonymous"
        }}</span>
        <span class="display-block">{{ message.message }}</span>
        <span :class="[$style['message-time'], 'display-block']">
          {{ new Date(message.timestamp).toLocaleTimeString() }}
        </span>
      </div>
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
        @keydown="handleKeyPress"
      />
      <BtnBase
        :btnClass="$style['button-send']"
        label="Send"
        :disabled="!isConnected"
        @click="handleSendMessage"
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
  margin-top: auto;
  width: 100%;
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
