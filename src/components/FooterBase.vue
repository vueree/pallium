<script setup lang="ts">
import { useWebSocketStore } from "@/stores/useWebSocketStore";

const webSocketStore = useWebSocketStore();
</script>

<template>
  <footer
    :class="[$style.wrapper, 'flex items-center w-full max-width mx-auto']"
  >
    <p
      :class="
        webSocketStore.isConnected ? $style['cl-green'] : $style['cl-red']
      "
    >
      {{ webSocketStore.isConnected ? "Connected" : "Disconnected" }}
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
