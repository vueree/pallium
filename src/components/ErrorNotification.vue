<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useErrorStore } from "@/stores/errorStore";

const errorStore = useErrorStore();
const { error, isVisible } = storeToRefs(errorStore);
</script>

<template>
  <Transition name="fade">
    <div
      v-if="isVisible && error"
      class="error-notification absolute rounded-10 error-text text-center"
    >
      {{ error }}
      <button
        class="close-button border-none close-button-text pointer"
        aria-label="Close error notification"
        @click="errorStore.hideError"
      >
        ×
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.error-notification {
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 30px 10px 10px;
  color: var(--color-red);
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  opacity: 0.9;
  width: 300px;
  z-index: 1000;
}

.close-button {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  color: var(--color-red);
  padding: 0 5px;
}

.close-button:hover {
  opacity: 0.7;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
