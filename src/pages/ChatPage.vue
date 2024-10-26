<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from "vue";
import InputBase from "@/components/atom/InputBase.vue";
import BtnBase from "@/components/atom/BtnBase.vue";
import type { IMessage } from "@/types";
import {
  getMessages,
  useMessages,
  sendMessage as sendChatMessage,
  clearMessages
} from "@/use/fetchChat";
import {
  initializeSocket,
  disconnectSocket,
  getSocket
} from "@/use/useWebSocket";
import Cookies from "js-cookie";

const chatInputRef = ref("");
const chatAreaRef = ref<HTMLElement | null>(null);
const usernameRef = ref("");
const messagesRef = useMessages();
const token = Cookies.get("auth_token");
const socket = getSocket();

const scrollToBottom = () => {
  nextTick(() => {
    if (chatAreaRef.value) {
      chatAreaRef.value.scrollTop = chatAreaRef.value.scrollHeight;
    }
  });
};

// const sendMessage = async () => {
//   const message = chatInputRef.value.trim();
//   if (message) {
//     try {
//       const newMessage = await sendChatMessage(message); // Отправка сообщения
//       socket?.emit("new_message", newMessage); // Отправка через сокет
//       chatInputRef.value = ""; // Очистка поля ввода
//       scrollToBottom();
//     } catch (error) {
//       console.error("Ошибка при отправке сообщения:", error.message);
//     }
//   }
// };

// const handleKeydown = async (event: KeyboardEvent) => {
//   if (event.key === "Enter" && !event.shiftKey) {
//     event.preventDefault();
//     await sendMessage(); // Используем новую функцию sendMessage
//   }
// };

const sendMessage = async () => {
  const message = chatInputRef.value.trim();
  if (message) {
    const newMessage = await sendChatMessage(message);
    socket?.emit("new_message", newMessage); // Отправка через сокет

    chatInputRef.value = "";
    scrollToBottom();
  } else {
    console.log("Ошибка при отправке сообщения");
  }
};

const handleKeydown = async (event: KeyboardEvent) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    const message = chatInputRef.value.trim();
    if (message) {
      await sendChatMessage(message);
      chatInputRef.value = ""; // Очистка поля ввода
    }
  }
};

const removeChat = async () => {
  try {
    if (token) {
      await clearMessages(token); // Очистка сообщений
      messagesRef.value = []; // Очистка списка сообщений
      socket?.emit("clear_messages"); // Отправка события на очистку сообщений
    }
  } catch (error) {
    console.error("Ошибка при очистке чата:", error);
  }
};

onMounted(async () => {
  if (token) {
    await getMessages(token); // Передаем токен и ждем результата
    console.log("Сообщения после получения:", messagesRef.value); // Проверка сообщений
    scrollToBottom();
    initializeSocket(token);
    console.log("Сообщения после получения:", messagesRef.value);
    socket?.on("message", (data: IMessage) => {
      messagesRef.value.push(data); // Обработка входящих сообщений
      scrollToBottom();
    });
  }
});

onUnmounted(() => {
  disconnectSocket();
});

watch(
  messagesRef,
  () => {
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
      @click="removeChat()"
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
