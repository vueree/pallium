<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import BtnBase from "@/components/atom/BtnBase.vue";
import LazyInfiniteLoader from "@/components/atom/InfiniteLoader.vue";
import LazySimpleBar from "@/components/atom/SimpleBar.vue";
import { type SimpleBarAPI } from "@/components/atom/SimpleBar.vue";
import { storeToRefs } from "pinia";
import {
  clearMessages,
  token,
  getUsername,
  MESSAGE_PER_PAGE
} from "@/use/useChat";
import { useWebSocketStore } from "@/stores/webSockets.store";

const chatInputRef = ref("");
const usernameRef = ref(getUsername());
const chatAreaRef = ref<HTMLElement | null>(null);

const webSocketStore = useWebSocketStore();
const { messages, isConnected, currentPage, totalPages } =
  storeToRefs(webSocketStore);

const router = useRouter();
const loading = ref(false);
const initialLoad = ref(false);

const loadMoreMessages = async () => {
  console.log("Loading more messages...");
  if (currentPage.value > 1 && !loading.value) {
    loading.value = true;
    const nextPage = currentPage.value - 1;
    await webSocketStore.fetchMessageHistory(nextPage, MESSAGE_PER_PAGE);

    nextTick(() => {
      if (chatAreaRef.value) {
        const currentScrollTop = chatAreaRef.value.scrollTop;
        const addedHeight =
          chatAreaRef.value.scrollHeight -
          currentScrollTop -
          chatAreaRef.value.clientHeight;
        chatAreaRef.value.scrollTop = addedHeight;
      }
      loading.value = false;
    });
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

console.log("LazyInfiniteLoader Props:", {
  currentPage: currentPage.value,
  totalPages: totalPages.value,
  isFetching: loading.value,
  chatAreaRef: chatAreaRef.value
});

const simpleBar = ref<SimpleBarAPI>();

onMounted(async () => {
  if (!token) {
    router.push({ name: "Login" });
    return;
  }

  initialLoad.value = true;
  try {
    await webSocketStore.connect(token);
    await webSocketStore.fetchMessageHistory(
      currentPage.value,
      MESSAGE_PER_PAGE
    );
  } catch (error) {
    console.error("Error connecting to WebSocket:", error);
  } finally {
    initialLoad.value = false;
  }
});

onUnmounted(() => {
  webSocketStore.disconnect();
});

watch(
  messages,
  () => {
    nextTick(() => {
      if (chatAreaRef.value && !initialLoad.value) {
        chatAreaRef.value.scrollTop = chatAreaRef.value.scrollHeight;
      }
    });
  },
  { deep: true }
);
</script>

<template>
  <main class="flex flex-column justify-between h-full max-width">
    <BtnBase
      v-show="messages.length"
      :btnClass="[$style['button-remove'], 'absolute']"
      label="Clear"
      @click="removeChat"
    />
    <LazySimpleBar ref="simpleBar" class="chat-area-wrapper">
      <div
        ref="chatAreaRef"
        :class="[$style['chat-area'], 'flex flex-column w-full']"
      >
        <LazyInfiniteLoader
          v-if="totalPages > 1"
          :isFetching="loading"
          :currentPage="currentPage"
          :lastPage="totalPages"
          :distance="100"
          :root="simpleBar?.scrollElement"
          @fetch="loadMoreMessages"
        >
          <div v-if="loading" class="loading-indicator">Loading...</div>
        </LazyInfiniteLoader>
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
      </div>
    </LazySimpleBar>

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

<style>
.chat-area-wrapper {
  height: calc(100vh - 200px);
}
</style>

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
