<script setup lang="ts">
import { useWebSocketStore } from "@/stores/useWebSocketStore";

const webSocketStore = useWebSocketStore();
</script>

<template>
  <footer :class="[$style.wrapper, 'flex items-center w-full']">
    <div class="flex justify-start w-full">
      <p :class="$style.title">WebSockets:</p>
      <p :class="webSocketStore.isConnected ? 'cl_green' : 'cl_red'">
        {{ webSocketStore.isConnected ? "Connected" : "Disconnected" }}
      </p>
    </div>
  </footer>
</template>

<style module>
footer {
  max-height: 60px;
  gap: 8px;
}
span {
  margin-right: auto;
}
.title {
  margin-right: 8px;
}
</style>
