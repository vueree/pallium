<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useChat } from "@/composables/useChat";
import BtnBase from "@/components/atom/BtnBase.vue";
import LazyInfiniteLoader from "@/components/atom/InfiniteLoader.vue";

const chatInputRef = ref("");
const loaderRef = ref<HTMLElement | null>(null);
const username = localStorage.getItem("username");

const chat = useChat();
const {
  messages,
  isConnected,
  currentPage,
  totalPages,
  loading,
  isLoadingMore,
  chatAreaRef,
  fetchMessageHistory,
  clearMessages,
  loadMoreMessages,
  handleMessageSend,
  scrollToBottom,
  setupWebSocket,
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
    scrollToBottom();
  });
};

watch(messages, async (newMessages, oldMessages) => {
  if (
    !isLoadingMore.value &&
    newMessages &&
    oldMessages &&
    newMessages.length > oldMessages.length
  ) {
    await scrollToBottom();
  }
});

onMounted(() => {
  setupWebSocket();

  fetchMessageHistory(1, 1);

  watch(
    messages,
    async (newMessages) => {
      if (!isLoadingMore.value && newMessages && newMessages.length > 0) {
        await scrollToBottom(true);
      }
    },
    { immediate: true }
  );
});

onUnmounted(() => {
  const { disconnect } = useChat();
  if (disconnect) {
    disconnect();
  }
});
</script>

<template>
  <main class="flex flex-column justify-between h-full max-width relative z-2">
    <BtnBase
      v-if="messages && messages.length > 0"
      :btnClass="['absolute', $style['button-remove']]"
      label="Clear"
      @click="clearMessages"
    />
    <div
      ref="chatAreaRef"
      :class="['flex flex-column h-full', $style['chat-area']]"
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
          message.username === username ? $style['own-message'] : '',
        ]"
      >
        <span :class="['chat-username', $style['message-user']]">
          {{ message.username }}
        </span>
        <span class="display-block chat-message">{{ message.message }}</span>
        <span
          :class="['display-block message-timestamp', $style['message-time']]"
        >
          {{ new Date(message.timestamp).toLocaleTimeString() }}
        </span>
      </div>
    </div>
    <div
      :class="[
        'flex gap-12 items-center mx-auto w-full mt-auto',
        $style['input-area'],
      ]"
    >
      <textarea
        v-model="chatInputRef"
        :class="['rounded-10 w-full', $style['text-area']]"
        placeholder="Enter your message..."
        rows="2"
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
  overflow-y: scroll;
}

.chat-area::-webkit-scrollbar {
  display: none;
}

.message {
  padding: 10px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--color-text-light);
  border: 1px solid var(--color-border);
  align-self: flex-start;
  margin-top: 6px;
  margin-bottom: 6px;
  transition: background-color 0.3s ease;
}

.message:last-child {
  margin-bottom: 20px;
}

.own-message {
  align-self: flex-end;
  color: var(--color-own-message);
  background-color: rgba(102, 179, 102, 0.2);
}

.message-user {
  color: var(--color-text-light);
}

.message-time {
  color: var(--color-text-muted);
  text-align: right;
}

.text-area {
  border: 1px solid var(--color-border);
  resize: none;
  padding: 8px 12px;
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--color-text-light);
  border-radius: 10px;
  transition: border-color 0.3s ease;
}

.input-area {
  margin-top: 12px;
  margin-bottom: 12px;
}

.text-area:focus {
  border-color: var(--gradient-opacity-low);
}

.button-remove {
  top: 70px;
  right: 50px;
  opacity: 0.1;
  transition: opacity 0.3s ease;
}

.button-remove:hover {
  opacity: 1;
}

.button-remove,
.button-send {
  max-width: 80px;
}

.button-send:disabled {
  background: rgba(102, 179, 102, 0.1);
  pointer-events: none;
}

.button-send:hover {
  background-position: right center;
}
</style>
