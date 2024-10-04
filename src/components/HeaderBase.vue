<script setup lang="ts">
import { ref } from "vue";
import InputBase from "./atom/InputBase.vue";

const inputValue = ref("");
</script>

<template>
  <header
    :class="[
      $style.header,
      'flex items-center justify-between w-full mx-auto p-16'
    ]"
  >
    <h3>Поступай так, словно это сон. Действуй смело и не ищи оправданий.</h3>
    <InputBase
      :modelValue="inputValue"
      type="password"
      minWidth="200px"
      placeholder="!#%&..."
    />
  </header>
</template>

<style module>
.header {
  min-height: 100px;
}
</style>
