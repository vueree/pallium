<script setup>
import { ref } from "vue";
import InputBase from "@/components/atom/InputBase.vue";
import BtnBase from "@/components/atom/BtnBase.vue";
import { registerUser } from "@/use/fetchChat";
import { useRouter } from "vue-router";

const router = useRouter();

const inputUsernameRef = ref("");
const inputPasswordRef = ref("");
const errorMessage = ref("");

const handleRegister = async () => {
  const username = inputUsernameRef.value;
  const password = inputPasswordRef.value;

  inputUsernameRef.value = "";
  inputPasswordRef.value = "";

  await registerUser(username, password, router);
};
</script>

<template>
  <form class="flex flex-column items-center" @submit.prevent="handleRegister">
    <h3 :class="$style.title">Регистрация</h3>
    <InputBase
      v-model="inputUsernameRef"
      :class="$style.input"
      id="username"
      type="text"
      isBorder
      placeholder="Имя пользователя"
    />
    <InputBase
      v-model="inputPasswordRef"
      :class="$style.input"
      id="password"
      type="password"
      isBorder
      placeholder="Пароль"
    />
    <!-- <InputBase
      v-model="inputEncryptionKeyRef"
      :class="$style.input"
      id="encryptionKey"
      type="password"
      isBorder
      placeholder="Код шифрования"
    /> -->
    <BtnBase
      :class="$style['submit-button']"
      type="submit"
      label="Регистрация пользователя"
      isLogin
    />
    <p v-if="errorMessage">{{ errorMessage }}</p>
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
