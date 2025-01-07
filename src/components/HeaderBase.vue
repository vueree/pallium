<script setup lang="ts">
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useWebSocketStore } from "@/stores/webSockets.store";
import Cookies from "js-cookie";
import { AUTH_TOKEN_KEY } from "@/use/useChat";

const router = useRouter();

const webSocketStore = useWebSocketStore();
const { isConnected } = storeToRefs(webSocketStore);

const handleLogout = () => {
  Cookies.remove(AUTH_TOKEN_KEY, {
    path: "/",
    // domain: "api-pallium.onrender.com"
    domain: "http://localhost:3000"
  });
  Cookies.remove(AUTH_TOKEN_KEY, { path: "/", domain: "pallium.onrender.com" });
  Cookies.remove(AUTH_TOKEN_KEY, {
    path: "/",
    domain: "http://localhost:3000"
  });

  router.push({ name: "Login" });
};
</script>

<template>
  <header class="flex items-center w-full max-width mx-auto">
    <a class="pointer" @click.prevent="handleLogout"> P A L L I U M </a>
    <span :class="isConnected ? $style['cl-green'] : $style['cl-red']">{{
      isConnected ? "is connected" : "is not connected"
    }}</span>
  </header>
</template>

<style module>
a {
  text-decoration: none;
  color: rgb(52, 93, 255);
  font-size: 16px;
  font-weight: 500;
}

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
