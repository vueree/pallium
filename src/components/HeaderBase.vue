<script setup lang="ts">
import { ref } from "vue";
import InputBase from "./atom/InputBase.vue";

const inputValueRef = ref("");
</script>

<template>
  <header class="flex items-center justify-between w-full mx-auto max-width">
    <h3>Добро пожаловать в теневой чат</h3>
    <InputBase
      :modelValue="inputValueRef"
      type="password"
      minWidth="150px"
      placeholder="Введите шифр..."
    />
  </header>
</template>

<style module>
.title {
  margin-top: auto;
}
</style>
