<script setup lang="ts">
import { ref, onMounted, watch, nextTick, onUnmounted } from "vue";
import InputBase from "@/components/atom/InputBase.vue";
import BtnBase from "@/components/atom/BtnBase.vue";
import type { IMessage } from "@/types";
import {
  getMessages,
  sendMessage as sendChatMessage,
  clearMessages
} from "@/use/fetchChat";

const chatInputRef = ref("");
const chatAreaRef = ref<HTMLElement | null>(null);
const messagesRef = ref<IMessage[]>([]);
const usernameRef = ref("");

const getToken = () => {
  return localStorage.getItem("auth_token");
};

const logout = () => {
  localStorage.removeItem("auth_token");
};

const scrollToBottom = () => {
  nextTick(() => {
    if (chatAreaRef.value) {
      chatAreaRef.value.scrollTop = chatAreaRef.value.scrollHeight;
    }
  });
};

const handleKeydown = async (event: KeyboardEvent) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    // Проверка на пустое сообщение
    if (chatInputRef.value.trim()) {
      try {
        const newMessage = await sendChatMessage(chatInputRef.value); // Передаем контент сообщения
        messagesRef.value.push(newMessage); // Добавляем сообщение в массив
        chatInputRef.value = "";
        chatInputRef.value = ""; // Очищаем поле ввода после отправки
      } catch (error) {
        console.error(error.message);
      }
    }
  }
};

const removeChat = () => {
  messagesRef.value = [];
  clearMessages();
};

onMounted(() => {
  const token = getToken();
  if (token) {
    getMessages()
      .then((messages) => {
        messagesRef.value = messages; // Store messages in the reactive variable
        console.log("✌️messagesRef.value --->", messagesRef.value);
      })
      .catch((error) => {
        console.error(error.message);
      });
  } else {
    console.error("User is not logged in. Please log in to view messages.");
  }
});

onUnmounted(() => logout());

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
          message.sender?.username === usernameRef ? $style.ownMessage : ''
        ]"
      >
        <span :class="$style.messageUser">{{
          message.sender?.username || "Unknown"
        }}</span>
        <span :class="$style.messageText">{{ message.content }}</span>
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
        <BtnBase @click="sendChatMessage(chatInputRef)" label="Send" />
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
