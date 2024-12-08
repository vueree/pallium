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
    <p>
      the room
      <span :class="isConnected ? $style['cl-green'] : $style['cl-red']">{{
        isConnected ? "is connected" : "is not connected"
      }}</span>
    </p>
  </footer>
</template>

<style module>
.cl-green {
  color: #66b366;
}

.cl-red {
  color: #cc4f4f;
}
</style>
