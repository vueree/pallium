<script setup lang="ts">
import { ref } from "vue";
import InputBase from "@/components/atom/InputBase.vue";

const inputPassRef = ref("");

const emit = defineEmits(["update:encryptionKey"]);

const handleKeyChange = () => {
  emit("update:encryptionKey", inputPassRef.value);
};
</script>

<template>
  <header class="flex items-center justify-between w-full mx-auto max-width">
    <InputBase
      v-model="inputPassRef"
      type="password"
      minWidth="150px"
      placeholder="Введите шифр..."
      @input="handleKeyChange"
    />
  </header>
</template>

<style module>
.title {
  margin-top: auto;
}
</style>
