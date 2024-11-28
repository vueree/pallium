<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { useWebSocketStore } from "@/stores/webSockets.store";
import { storeToRefs } from "pinia";

const webSocketStore = useWebSocketStore();
console.log("✌️useWebSocketStore --->", useWebSocketStore);
const isConnected = storeToRefs(webSocketStore);

onUnmounted(() => {
  webSocketStore.disconnect();
});
</script>

<template>
  <footer
    :class="[$style.wrapper, 'flex items-center w-full max-width mx-auto']"
  >
    <p :class="isConnected ? $style['cl-green'] : $style['cl-red']">
      {{ isConnected ? "Connected" : "Disconnected" }}
    </p>
  </footer>
</template>

<style module>
.wrapper {
  max-height: 60px;
}

.cl-green {
  color: green;
}

.cl-red {
  color: red;
}
</style>
