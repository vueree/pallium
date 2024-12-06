// ChatPage.vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from "vue";
import { storeToRefs } from "pinia";
import BtnBase from "@/components/atom/BtnBase.vue";
import { clearMessages, getMessages, token, getUsername } from "@/use/useChat";
import { useWebSocketStore } from "@/stores/webSockets.store";

const chatInputRef = ref("");
const usernameRef = ref(getUsername());
const chatAreaRef = ref<HTMLElement | null>(null);

const webSocketStore = useWebSocketStore();
const { messages, isConnected } = storeToRefs(webSocketStore);

const sortedMessages = computed(() => [...messages.value].reverse());

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
  if (token) {
    webSocketStore.connect(token);
    await getMessages();
  }
});

onUnmounted(() => {
  webSocketStore.disconnect();
});

watch(sortedMessages, scrollToBottom, { deep: true });
</script>

<template>
  <main :class="[$style.wrapper, 'flex flex-column w-full h-full']">
    <BtnBase
      v-show="sortedMessages.length"
      :btnClass="[$style['button-remove'], 'absolute']"
      label="Clear"
      @click="removeChat"
    />

    <div
      ref="chatAreaRef"
      :class="[$style.chatArea, 'flex flex-column w-full']"
    >
      <div
        v-for="(message, index) in sortedMessages"
        :key="`${message.timestamp}-${index}`"
        :class="[
          $style.message,
          message.username === usernameRef ? $style.ownMessage : ''
        ]"
      >
        <span :class="$style.messageUser">
          {{ message.username || "Anonymous" }}
        </span>
        <span :class="$style.messageText">{{ message.message }}</span>
        <span :class="$style.messageTime">
          {{ new Date(message.timestamp).toLocaleTimeString() }}
        </span>
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
        :disabled="!isConnected"
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
  overflow-y: auto;
  padding: 20px;
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
  margin-right: 10px;
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

.textArea {
  border: 1px solid rgba(173, 180, 230, 0.5);
  resize: none;
  padding: 8px 12px;
  border-radius: 10px;
}

.inputArea {
  margin-top: auto;
  margin-bottom: 8px;
}

.button-remove {
  top: -56px;
  right: -6px;
  opacity: 0.1;
}

.button-remove,
.button-send {
  width: 80px;
}
</style>
