<script setup lang="ts">
import { ref } from "vue";
import InputBase from "@/components/atom/InputBase.vue";
import type { IMessage } from "../types/index.ts";

const chatInput = ref("");
const messages = ref<IMessage[]>([]);

const sendMessage = () => {
  if (chatInput.value.trim()) {
    messages.value.push({
      id: Date.now(),
      text: chatInput.value,
      timestamp: new Date()
    });
    chatInput.value = "";
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
};
</script>

<template>
  <main
    :class="[$style.wrapper, 'flex flex-column p-16 w-full h-full mx-auto']"
  >
    <div :class="[$style.chatArea, 'flex w-full']">
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
        @keydown="handleKeydown"
      >
        <button :class="$style['magic-border-button']">
          <span :class="$style['magic-border-button__text']">Send</span>
        </button>
      </InputBase>
    </div>
  </main>
</template>

<style module>
.wrapper {
  min-height: 700px;
}

.chatArea {
  flex-grow: 1;
  overflow-y: auto;
  flex-direction: column-reverse;
}

.message {
  padding: 4px;
  background-color: #f0f0f0;
  border-radius: 8px;
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
  padding-top: 10px;
  margin-top: auto;
}

.magic-border-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 20px;
  border-radius: 20px;
  background-color: #1e293b;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  border: none;
  outline: none;
  overflow: hidden;
  transition: all 0.3s ease;
}

.magic-border-button::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  padding: 2px;
  background: linear-gradient(135deg, #ff6fd8, #3813c2, #ff6fd8, #3813c2);
  background-size: 400% 400%;
  animation: magic-border-gradient 5s ease infinite;
  z-index: 1;
}

.magic-border-button__text {
  z-index: 1;
}

@keyframes magic-border-gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
