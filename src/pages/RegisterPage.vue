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
    <h3 :class="$style.title">Greate account</h3>
    <div class="flex flex-column gap-12">
      <InputBase
        v-model="inputUsernameRef"
        id="username"
        width="300px"
        type="text"
        isBorder
        placeholder="Имя пользователя"
      />
      <InputBase
        v-model="inputPasswordRef"
        id="password"
        type="password"
        isBorder
        placeholder="Пароль"
      />
    </div>
    <BtnBase
      :class="[$style['submit-button'], 'w-full']"
      type="submit"
      label="Get Started"
    />
    <p v-if="errorMessage">{{ errorMessage }}</p>
  </form>
</template>

<style module>
.title {
  margin-top: 140px;
  font-size: 24px;
}

.submit-button {
  margin-top: 20px;
  height: 50px;
  width: 200px;
}
</style>
