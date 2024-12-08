<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useWebSocketStore } from "@/stores/webSockets.store";

const webSocketStore = useWebSocketStore();
const { isConnected } = storeToRefs(webSocketStore);
</script>

<template>
  <footer
    :class="[$style.wrapper, 'flex items-center w-full max-width mx-auto']"
  >
    <span> the room </span>
    <span :class="isConnected ? $style['cl-green'] : $style['cl-red']">{{
      isConnected ? "is connected" : "is not connected"
    }}</span>
  </footer>
</template>

<style module>
.cl-green,
.cl-red {
  margin-left: 10px;
}

.cl-green {
  color: #66b366;
}

.cl-red {
  color: #cc4f4f;
}
</style>
