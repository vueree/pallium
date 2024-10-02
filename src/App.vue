<script setup lang="ts">
import HeaderBase from "./components/HeaderBase.vue";
import FooterBase from "./components/FooterBase.vue";
import ShadowChat from "./views/ShadowChat.vue";
</script>

<template>
  <div>
    <HeaderBase />
    <div>
      <ShadowChat />
    </div>
    <FooterBase />
  </div>
</template>
