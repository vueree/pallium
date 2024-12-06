<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import InputBase from "@/components/atom/InputBase.vue";
import BtnBase from "@/components/atom/BtnBase.vue";
import { loginUser } from "@/use/fetchChat";

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
    <form class="flex flex-column items-center" @submit.prevent="handleLogin">
      <h3 :class="$style.title">Welcome!</h3>
      <div class="flex flex-column gap-12">
        <InputBase
          v-model="inputUsernameRef"
          width="300px"
          type="text"
          isBorder
          placeholder="Username"
        />
        <InputBase
          v-model="inputPasswordRef"
          type="password"
          isBorder
          placeholder="Password"
        />
      </div>
      <div :class="[$style['btn-container'], 'flex gap-12 w-full']">
        <BtnBase
          :class="$style['submit-button']"
          type="submit"
          label="Sing in"
        />
        <BtnBase
          :btnClass="$style['submit-button']"
          :href="$router.resolve({ name: 'Registration' }).href"
          label="Create account"
        />
      </div>
    </form>
  </main>
</template>

<style module>
.title {
  margin-top: 140px;
  font-size: 24px;
}

.btn-container {
  width: 300px;
}

.submit-button {
  margin-top: 20px;
  flex-grow: 1;
  padding: 10px;
  box-sizing: border-box;
}
</style>
