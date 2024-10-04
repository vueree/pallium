<script setup lang="ts">
import HeaderBase from "./components/HeaderBase.vue";
import FooterBase from "./components/FooterBase.vue";
import ShadowChat from "./views/ShadowChat.vue";
</script>

<template>
  <div class="flex flex-column">
    <HeaderBase />
    <div class="cl_dived w-full" />
    <ShadowChat class="mx-auto" />
    <div class="cl_dived w-full" />
    <FooterBase class="max-width mx-auto" />
  </div>
</template>
