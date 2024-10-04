<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import InputBase from "@/components/atom/InputBase.vue";
import BtnBase from "@/components/atom/BtnBase.vue";
import type { IMessage } from "../types/index.ts";

const chatInput = ref("");
const messages = ref<IMessage[]>([]);

// Функция для сохранения сообщений в localStorage
const saveMessagesToLocalStorage = () => {
  localStorage.setItem("chatMessages", JSON.stringify(messages.value));
};

// Функция для загрузки сообщений из localStorage
const loadMessagesFromLocalStorage = () => {
  const savedMessages = localStorage.getItem("chatMessages");
  if (savedMessages) {
    messages.value = JSON.parse(savedMessages).map((message: IMessage) => ({
      ...message,
      timestamp: new Date(message.timestamp)
    }));
  }
};

const sendMessage = () => {
  if (chatInput.value.trim()) {
    const newMessage = {
      id: Date.now(),
      text: chatInput.value,
      timestamp: new Date()
    };
    messages.value = [...messages.value, newMessage];
    chatInput.value = "";
    saveMessagesToLocalStorage();
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
};

const removeChat = () => {
  messages.value = [];
};

// Загрузка сообщений при монтировании компонента
onMounted(() => {
  loadMessagesFromLocalStorage();
});

// Сохранение сообщений при их изменении
watch(
  messages,
  () => {
    saveMessagesToLocalStorage();
  },
  { deep: true }
);
</script>

<template>
  <main
    :class="[
      $style.wrapper,
      'flex flex-column w-full h-full mx-auto max-width'
    ]"
  >
    <BtnBase :class="$style['button-remove']" label="" @click="removeChat" />
    <div :class="[$style.chatArea, 'flex flex-column w-full']">
      <div
        v-for="message in messages"
        :key="message.id"
        :class="$style.message"
      >
        <span :class="$style.messageText">{{ message.text }}</span>
        <span :class="$style.messageTime">{{
          message.timestamp.toLocaleTimeString()
        }}</span>
      </div>
    </div>
    <div :class="[$style.inputArea, 'flex']">
      <InputBase
        v-model="chatInput"
        class="w-full"
        type="text"
        placeholder="Введите сообщение..."
        width="1200px"
        @keydown="handleKeydown"
      >
        <BtnBase @click="sendMessage" />
      </InputBase>
    </div>
  </main>
</template>

<style module>
.wrapper {
  position: relative;
  height: calc(100vh - 120px);
}

.chatArea {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px 0;
}

.message {
  padding: 4px 0;
  align-self: flex-start;
}

.messageText {
  display: block;
}

.messageText,
.message {
  margin-bottom: 4px;
}

.messageTime {
  font-size: 0.8em;
  color: #888;
}

.inputArea {
  margin-top: auto;
}

.button-remove {
  position: absolute;
  right: 0;
  top: 10px;
}
</style>
