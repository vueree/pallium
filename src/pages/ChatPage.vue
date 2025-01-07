<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, onUpdated } from "vue";
import { useRouter } from "vue-router";
import BtnBase from "@/components/atom/BtnBase.vue";
import LazyInfiniteLoader from "@/components/atom/InfiniteLoader.vue";
import { storeToRefs } from "pinia";
import { useWebSocketStore } from "@/stores/webSockets.store";
import { useChatState, fetchMessageHistory } from "@/use/useChat";
import { usePaginationStore } from "@/use/usePaginationStore";

const router = useRouter();
const chatAreaRef = ref<HTMLElement | null>(null);
const chatInputRef = ref("");

const loaderRef = ref<HTMLElement | null>(null);
const isIntersecting = ref(false); // Видимость LazyInfiniteLoader

const webSocketStore = useWebSocketStore();
const { messages, isConnected, token } = storeToRefs(webSocketStore);

const {
  handleKeyPress,
  handleMessageSend,
  initializeChat,
  loadMoreMessages,
  clearMessages
} = useChatState();

const { totalPages, currentPage, loading } = usePaginationStore();

onUpdated(() => {
  if (loaderRef.value) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting.value = entry.isIntersecting;

        if (isIntersecting.value && !loading && currentPage < totalPages) {
          loadMoreMessages(); // Загружаем дополнительные сообщения
        }
      },
      {
        rootMargin: "0px",
        threshold: 0.1 // Когда элемент виден на 10%
      }
    );
    observer.observe(loaderRef.value);

    // Очистка observer при размонтировании
    onUnmounted(() => {
      observer.disconnect();
    });
  }
});

onMounted(async () => {
  await nextTick(); // Дожидаемся, пока обновится DOM и токен
  console.log("Token after nextTick:", token.value);
  if (!token.value) {
    console.error("🚨 Token is missing, redirecting to Login...");
    nextTick(() => {
      router.push({ name: "Login" });
    });
    return;
  }

  // Подключение WebSocket через store
  webSocketStore.connect("wss://localhost:3000/chat");

  // Когда WebSocket соединение установлено
  watch(
    isConnected,
    async (connected) => {
      if (connected) {
        await initializeChat(() => {
          chatAreaRef.value?.scrollTo({ top: chatAreaRef.value.scrollHeight });
        });
        await fetchMessageHistory(currentPage, totalPages); // Загрузка истории сообщений
      }
    },
    { immediate: true }
  );

  // Обработка входящих сообщений
  webSocketStore.socket?.addEventListener("message", (event: any) => {
    const data = JSON.parse(event.data);
    console.log("New message received:", data);
    messages.value.push(data); // Добавление сообщения в список
  });
});

// Автоматический скролл при изменении сообщений
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
  <main v-if="token" class="flex flex-col justify-between h-full max-width">
    <!-- Кнопка очистки сообщений -->
    <BtnBase
      v-if="messages && messages.length > 0"
      :btnClass="[$style['button-remove'], 'absolute']"
      label="Clear"
      @click="clearMessages"
    />

    <!-- Область сообщений -->
    <div
      ref="chatAreaRef"
      :class="[$style['chat-area'], 'flex flex-column w-full']"
    >
      <!-- Компонент LazyInfiniteLoader -->
      <LazyInfiniteLoader
        ref="loaderRef"
        v-if="totalPages > 1"
        :isFetching="loading"
        :currentPage="currentPage"
        :lastPage="totalPages"
        :distance="100"
        @fetch="loadMoreMessages"
      >
        <div v-if="loading" class="loading-indicator">Loading...</div>
      </LazyInfiniteLoader>

      <!-- Список сообщений -->
      <div
        v-for="(message, index) in messages"
        :key="`${message.timestamp}-${index}`"
        :class="[
          $style.message,
          message.username === webSocketStore.username
            ? $style['own-message']
            : ''
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

    <!-- Область ввода -->
    <div
      :class="[$style['input-area'], 'flex gap-12 items-center mx-auto w-full']"
    >
      <textarea
        v-model="chatInputRef"
        :class="[$style['text-area'], 'rounded-10 w-full']"
        placeholder="Enter your message..."
        rows="3"
        spellcheck="true"
        @keydown="
          (event) =>
            handleKeyPress(event, () =>
              handleMessageSend(chatInputRef, () => (chatInputRef = ''))
            )
        "
      />
      <BtnBase
        :btnClass="$style['button-send']"
        label="Send"
        :disabled="!isConnected"
        @click="handleMessageSend(chatInputRef, () => (chatInputRef = ''))"
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
