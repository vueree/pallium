<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useWebSocketStore } from "@/stores/webSockets.store";

const webSocketStore = useWebSocketStore();
const isConnected = storeToRefs(webSocketStore);
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
