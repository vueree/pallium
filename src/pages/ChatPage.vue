<script setup lang="ts">
import {
  ref,
  onMounted,
  onUnmounted,
  nextTick,
  watch,
  onBeforeMount
} from "vue";
import InputBase from "@/components/atom/InputBase.vue";
import BtnBase from "@/components/atom/BtnBase.vue";
import { useMessages, clearMessages, getMessages } from "@/use/fetchChat";
import { useWebSocketStore } from "@/stores/webSockets.store";
import Cookies from "js-cookie";

const chatInputRef = ref("");
const usernameRef = ref("");
const messagesRef = useMessages();
const token = Cookies.get("auth_token");
const webSocketStore = useWebSocketStore();
// const messageContent = ref(""); // Поле ввода сообщения
const chatAreaRef = ref<HTMLElement | null>(null);

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

// const handleKeydown = async (event: KeyboardEvent) => {
//   if (event.key === "Enter" && !event.shiftKey) {
//     event.preventDefault();

//     if (chatInputRef.value.trim() === "") {
//       console.warn("Cannot send empty message");
//       return;
//     }

//     // Вызываем sendMessage из стора с данными
//     webSocketStore.sendMessage({
//       message: chatInputRef.value,
//       username: "YourUsername" // Здесь замените на динамическое имя пользователя
//     });

//     chatInputRef.value = ""; // Очищаем поле после отправки
//   }
// };

const handleKeydown = async (event: KeyboardEvent) => {
  webSocketStore.connect(token); // Подключение к WebSocket

  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();

    if (!webSocketStore.isConnected) {
      console.error("WebSocket is not connected");
      return;
    }

    if (chatInputRef.value.trim() === "") {
      console.warn("Cannot send empty message");
      return;
    }

    console.log("Sending message:", {
      message: chatInputRef.value,
      username: localStorage.getItem("username") || "Anonymous"
    });

    webSocketStore.sendMessage({
      message: chatInputRef.value,
      username: localStorage.getItem("username") || "Anonymous"
    });

    chatInputRef.value = ""; // Очищаем поле после отправки
  }
};

onMounted(() => {
  if (token) {
    // webSocketStore.connect(token); // Подключение к WebSocket
    getMessages()
      .then(() => scrollToBottom())
      .catch((error) => console.error("Ошибка при инициализации чата:", error));
  }
});

onUnmounted(() => {
  webSocketStore.disconnect(); // Отключение от WebSocket
});

// const getMessages = async () => {
//   try {
//     if (token) {
//       // webSocketStore.connect(token); // Установить соединение с WebSocket
//     }

//     const socket = webSocketStore.getSocket();

//     if (socket) {
//       socket.emit("request_message_history"); // Отправляем запрос на получение истории
//     }
//   } catch (error) {
//     console.error("Ошибка при получении сообщений:", error);
//   }
// };

// Вызов getMessages в beforeMount
onBeforeMount(() => {
  getMessages();
});

watch(messagesRef, () => scrollToBottom(), { deep: true });
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
      ref="chatAreaRef"
      :class="[$style.chatArea, 'flex flex-column w-full']"
    >
      <div
        v-for="(message, index) in messagesRef"
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
    <div :class="[$style.inputArea, 'flex']">
      <InputBase
        v-model="chatInputRef"
        class="w-full"
        type="text"
        placeholder="Введите сообщение..."
        width="1200px"
        @keydown="handleKeydown"
      />
      <BtnBase @click="handleKeydown" label="Send" />
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
