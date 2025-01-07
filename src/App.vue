<script setup lang="ts">
import { RouterView } from "vue-router";
import HeaderBase from "./components/HeaderBase.vue";
import FooterBase from "./components/FooterBase.vue";
import { useHead } from "@vueuse/head";

useHead({
  link: [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossorigin: "anonymous"
    },
    {
      href: "https://fonts.googleapis.com/css2?family=Raleway:wght@100;400;700&display=swap",
      rel: "stylesheet"
    }
  ]
});
</script>

<template>
  <HeaderBase />
  <div class="cl_dived" />
  <router-view :class="['mx-auto max-width', $style['chat-area-wrapper']]" />
  <div class="cl_dived" />
  <FooterBase />
</template>

<style module>
.chat-area-wrapper {
  height: calc(100vh - 120px);
}
</style>
