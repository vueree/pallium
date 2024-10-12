<script setup lang="ts">
import { ref } from "vue";
import InputBase from "@/components/atom/InputBase.vue";
import BtnBase from "@/components/atom/BtnBase.vue";

const inputPassRef = ref("");

const emit = defineEmits(["update:encryptionKey"]);

const handleKeyChange = () => {
  emit("update:encryptionKey", inputPassRef.value);
};

const handleSubmit = (event: Event) => {
  event.preventDefault();
  if (inputPassRef.value) {
    emit("update:encryptionKey", inputPassRef.value);
  }
};
</script>

<template>
  <form
    @submit="handleSubmit"
    :class="['max-height flex flex-column items-center ']"
  >
    <h1 :class="$style.title">Введите ключ шифрования</h1>
    <InputBase
      v-model="inputPassRef"
      :class="$style.input"
      isBorder
      type="password"
      @input="handleKeyChange"
    />
    <BtnBase
      type="submit"
      isLogin
      :class="$style['submit-button']"
      label="Начать чат"
    />
  </form>
</template>

<style module>
.title {
  margin-top: 140px;
  font-size: 24px;
}

.input {
  margin-top: 20px;
}

.submit-button {
  margin-top: 20px;
  height: 50px;
  width: 200px;
}
</style>
