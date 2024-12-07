<script setup lang="ts">
import { useRouter } from "vue-router";
import Cookies from "js-cookie";
import { AUTH_TOKEN_KEY } from "@/use/useChat";

const router = useRouter();

const handleLogout = () => {
  Cookies.remove(AUTH_TOKEN_KEY, {
    path: "/",
    domain: "api-pallium.onrender.com"
  });
  Cookies.remove(AUTH_TOKEN_KEY, { path: "/", domain: "pallium.onrender.com" });
  Cookies.remove(AUTH_TOKEN_KEY, { path: "/", domain: "localhost" });

  router.push({ name: "Login" });
};
</script>

<template>
  <header class="flex items-center w-full max-width mx-auto">
    <a class="pointer" @click.prevent="handleLogout"> P A L L I U M </a>
  </header>
</template>

<style module>
a {
  text-decoration: none;
  color: rgb(52, 93, 255);
  font-size: 16px;
  font-weight: 500;
}
</style>
