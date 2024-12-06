<script setup lang="ts">
import {
  ref,
  onMounted,
  onUnmounted,
  nextTick,
  watch,
  onBeforeMount,
  computed
} from "vue";
import BtnBase from "@/components/atom/BtnBase.vue";
import { clearMessages, getMessages, messagesRef } from "@/use/fetchChat";
import { useWebSocketStore } from "@/stores/webSockets.store";
import Cookies from "js-cookie";

const token = Cookies.get("auth_token");
const chatInputRef = ref("");
const usernameRef = ref(localStorage.getItem("username") || "");
const webSocketStore = useWebSocketStore();
const chatAreaRef = ref<HTMLElement | null>(null);

const messages = computed(() => [...messagesRef.value].reverse());

const scrollToBottom = () => {
  nextTick(() => {
    if (chatAreaRef.value) {
      chatAreaRef.value.scrollTop = chatAreaRef.value.scrollHeight;
    }
  });
};

const removeChat = async () => {
  if (token) {
    await clearMessages();
  }
};

const sendMessage = () => {
  if (!webSocketStore.isConnected) {
    console.error("WebSocket is not connected");
    return;
  }

  if (chatInputRef.value.trim() === "") {
    console.warn("Cannot send empty message");
    return;
  }

  webSocketStore.sendMessage({
    message: chatInputRef.value,
    username: localStorage.getItem("username") || "Anonymous"
  });

  chatInputRef.value = "";
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
};

onBeforeMount(() => {
  getMessages()
    .then(() => scrollToBottom())
    .catch((error) => console.error("Ошибка при инициализации чата:", error));
});

onMounted(() => {
  if (token) {
    webSocketStore.connect(token);
  }
});

onUnmounted(() => {
  webSocketStore.disconnect();
});

onBeforeMount(() => {
  getMessages();
});

watch(messages, () => scrollToBottom(), { deep: true });
</script>

<template>
  <main :class="[$style.wrapper, 'flex flex-column w-full h-full']">
    <BtnBase
      v-show="messages.length > 0"
      :class="[$style['button-remove'], 'absolute']"
      label="Clear"
      @click="removeChat"
    />
    <div
      ref="chatAreaRef"
      :class="[$style.chatArea, 'flex flex-column w-full']"
    >
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="[
          $style.message,
          message.username === usernameRef ? $style.ownMessage : ''
        ]"
      >
        <span :class="$style.messageUser">{{
          message.username || "Anonymous"
        }}</span>
        <span :class="$style.messageText">{{ message.message }}</span>
        <span :class="$style.messageTime">{{
          new Date(message.timestamp).toLocaleTimeString()
        }}</span>
      </div>
    </div>
    <div :class="[$style.inputArea, 'flex gap-12 items-center']">
      <textarea
        v-model="chatInputRef"
        :class="[$style.textArea, 'w-full']"
        placeholder="Введите сообщение..."
        rows="3"
        spellcheck="true"
        @keydown="handleKeydown"
      />
      <BtnBase
        :btnClass="$style['button-send']"
        label="Send"
        @click="sendMessage"
      />
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

.textArea {
  border: 1px solid rgba(173, 180, 230, 0.5);
  resize: none;
  padding: 8px 12px;
  border-radius: 10px;
}

.messageTime {
  font-size: 0.8em;
  color: #888;
  display: block;
  text-align: right;
}

.inputArea {
  margin-top: auto;
  margin-bottom: 8px;
}

.button-remove {
  top: -56px;
  right: -6px;
  opacity: 10%;
}

.button-remove,
.button-send {
  width: 80px;
}
</style>
