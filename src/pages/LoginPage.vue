<script setup lang="ts">
import { ref } from "vue";
import InputBase from "@/components/atom/InputBase.vue";
import BtnBase from "@/components/atom/BtnBase.vue";
import { loginUser } from "@/use/fetchChat";
import { useRouter } from "vue-router";

const router = useRouter();

const inputUsernameRef = ref("");
const inputPasswordRef = ref("");

const handleLogin = async () => {
  const username = inputUsernameRef.value;
  const password = inputPasswordRef.value;

  inputUsernameRef.value = "";
  inputPasswordRef.value = "";

  await loginUser(username, password, router);
};
</script>

<template>
  <main>
    <form @submit.prevent="handleLogin" class="flex flex-column items-center">
      <h3 :class="$style.title">Введите имя пользователя</h3>
      <InputBase
        v-model="inputUsernameRef"
        :class="$style.input"
        type="text"
        isBorder
        placeholder="Имя пользователя"
      />
      <InputBase
        v-model="inputPasswordRef"
        :class="$style.input"
        type="password"
        isBorder
        placeholder="Пароль"
      />
      <BtnBase
        :class="$style['submit-button']"
        type="submit"
        label="Начать чат"
        isLogin
      />
      <a
        :href="$router.resolve({ name: 'Registration' }).href"
        :class="$style['register-link']"
      >
        Регистрация
      </a>
    </form>
  </main>
</template>

<style module>
.title {
  margin-top: 140px;
  font-size: 24px;
}

.register-link {
  padding: 16px 8px;
  border: 1px solid black;
  margin-top: 12px;
  cursor: pointer;
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
