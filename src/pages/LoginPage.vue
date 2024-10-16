<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import InputBase from "@/components/atom/InputBase.vue";
import BtnBase from "@/components/atom/BtnBase.vue";
import axios from "axios";

const router = useRouter();
const inputUsernameRef = ref("");
const inputPasswordRef = ref("");

const handleSubmit = async () => {
  try {
    const response = await axios.post(
      "http://localhost:3000/register",
      {
        username: inputUsernameRef.value,
        password: inputPasswordRef.value
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
    console.log("Registration successful:", response.data);
    router.push({ name: "Chat", query: { username: inputUsernameRef.value } });
    // Перенаправление пользователя или другое действие после успешной регистрации
  } catch (error) {
    console.error("Error during registration:", error);
    alert(
      `Ошибка регистрации: ${error.response?.data?.error || error.message}`
    );
  }
};
</script>

<template>
  <main>
    <form
      @submit.prevent="handleSubmit"
      class="max-height flex flex-column items-center"
    >
      <h1 :class="$style.title">Введите имя пользователя</h1>
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
        placeholder="Код шифрования"
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
