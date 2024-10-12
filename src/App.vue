<script setup lang="ts">
import { ref } from "vue";
import HeaderBase from "./components/HeaderBase.vue";
import FooterBase from "./components/FooterBase.vue";
import ChatArea from "./views/ChatArea.vue";
import LoginPage from "./views/LoginPage.vue";

const encryptionKeyProp = ref("");
const access = ref(false);
</script>

<template>
  <div class="flex flex-column">
    <HeaderBase
      @update:encryptionKey="
        (encryptionKey) => (encryptionKeyProp = encryptionKey)
      "
    />
    <div class="cl_dived w-full" />
    <body class="mx-auto">
      <LoginPage />
    </body>
    <ChatArea
      v-if="access"
      :encryptionKey="encryptionKeyProp"
      class="mx-auto"
    />
    <div class="cl_dived w-full" />
    <FooterBase class="max-width mx-auto" />
  </div>
</template>
