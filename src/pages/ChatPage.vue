// chatpage.vue
<script setup lang="ts">
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import InputBase from "@/components/atom/InputBase.vue";
import BtnBase from "@/components/atom/BtnBase.vue";
import { useChat } from "@/use/useChat";
import { useWebSocket } from "@/use/useWebSocket";
import type { IMessage } from "@/types";

const route = useRoute();
const { getChatHistory, clearChatHistory, messages: messagesRef } = useChat();

const chatInputRef = ref("");
const chatAreaRef = ref<HTMLElement | null>(null);
const usernameRef = ref(
  route.query.username || "User" + Math.floor(Math.random() * 1000)
);
const encryptionKeyRef = ref(route.query.key || "");

const scrollToBottom = () => {
  nextTick(() => {
    if (chatAreaRef.value) {
      chatAreaRef.value.scrollTop = chatAreaRef.value.scrollHeight;
    }
  });
};

const {
  connectWebSocket,
  sendMessage,
  closeConnection,
  isConnected,
  setEncryptionKey
} = useWebSocket({
  url: "ws://localhost:3000",
  onMessage: (newMessage: IMessage) => {
    const decryptedMessage: IMessage = {
      ...newMessage,
      text: xorEncryptDecrypt(newMessage.text, encryptionKeyRef.value)
    };
    messagesRef.value.push(decryptedMessage);
    scrollToBottom();
  },
  onError: (error) => {
    console.error("WebSocket error:", error);
  },
  onClose: () => {
    console.log("WebSocket connection closed");
  }
});

const handleSendMessage = () => {
  if (chatInputRef.value.trim() && isConnected.value) {
    const newMessage: IMessage = {
      id: Date.now(),
      text: chatInputRef.value,
      user: usernameRef.value,
      timestamp: new Date().toISOString()
    };
    sendMessage(newMessage);
    messagesRef.value.push(newMessage); // Добавляем сообщение сразу, чтобы оно отображалось.
    chatInputRef.value = "";
    scrollToBottom();
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    handleSendMessage();
  }
};

const removeChat = async () => {
  await clearChatHistory();
  scrollToBottom();
};

onMounted(async () => {
  connectWebSocket();
  setEncryptionKey(encryptionKeyRef.value); // Устанавливаем ключ шифрования при подключении.
  await getChatHistory();
  scrollToBottom();
});

onBeforeUnmount(() => {
  closeConnection();
});

watch(
  messagesRef,
  () => {
    scrollToBottom();
  },
  { deep: true }
);

function xorEncryptDecrypt(input: string, key: string): string {
  let output = "";
  for (let i = 0; i < input.length; i++) {
    output += String.fromCharCode(
      input.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return output;
}
</script>

<template>
  <main
    :class="[
      $style.wrapper,
      'flex flex-column w-full h-full mx-auto max-width relative max-height'
    ]"
  >
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
          message.user === usernameRef.value ? $style.ownMessage : ''
        ]"
      >
        <span :class="$style.messageUser">{{ message.user }}</span>
        <span :class="$style.messageText">{{ message.text }}</span>
        <span :class="$style.messageTime">
          {{
            new Date(message.timestamp).toLocaleTimeString() || "Unknown Time"
          }}
        </span>
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
        <BtnBase
          targetButton="SendMessage"
          label="Отправить"
          @click="handleSendMessage"
        />
      </InputBase>
    </div>
  </main>
</template>

<style module>
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
