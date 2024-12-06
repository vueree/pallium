<script setup lang="ts">
import { ref } from "vue";

const inputValueRef = ref("");
</script>

<template>
  <header class="flex items-center w-full max-width mx-auto">
    <a :href="$router.resolve({ name: 'Login' }).href">P A L L I U M</a>
  </header>
</template>

<style module>
a {
  text-decoration: none;
  color: rgb(52, 93, 255);
  cursor: pointer;
}
</style>
