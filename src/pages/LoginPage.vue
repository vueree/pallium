<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import InputBase from "@/components/atom/InputBase.vue";
import BtnBase from "@/components/atom/BtnBase.vue";

const router = useRouter();
const inputKeyRef = ref("");
const inputUsernameRef = ref("");

const handleSubmit = () => {
  // Здесь можно добавить логику проверки ключа и имени пользователя
  router.push({
    name: "Chat",
    query: { key: inputKeyRef.value, username: inputUsernameRef.value }
  });
};
</script>

<template>
  <main>
    <form
      @submit.prevent="handleSubmit"
      class="max-height flex flex-column items-center"
    >
      <h1 :class="$style.title">Введите ключ шифрования</h1>
      <InputBase
        v-model="inputKeyRef"
        :class="$style.input"
        type="password"
        isBorder
        placeholder="Ключ шифрования"
      />
      <InputBase
        v-model="inputUsernameRef"
        :class="$style.input"
        type="text"
        isBorder
        placeholder="Имя пользователя"
      />
      <BtnBase
        type="submit"
        :class="$style['submit-button']"
        label="Начать чат"
        isLogin
      />
    </form>
  </main>
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
