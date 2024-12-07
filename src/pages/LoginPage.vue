<script setup lang="ts">
import { useRouter } from "vue-router";
import InputBase from "@/components/atom/InputBase.vue";
import BtnBase from "@/components/atom/BtnBase.vue";
import { useAuth } from "@/use/useAuth";
import { INPUT_WIDTH } from "@/use/useChat";

const router = useRouter();
const { state, handleSubmit } = useAuth(false);

const handleLogin = () => handleSubmit(router);
</script>

<template>
  <main>
    <form
      :class="$style.form"
      class="flex flex-column items-center"
      @submit.prevent="handleLogin"
    >
      <h3 class="title">Welcome!</h3>

      <div v-if="state.error" :class="[$style.error, 'absolute rounded-10']">
        {{ state.error }}
      </div>

      <div class="flex flex-column gap-12">
        <InputBase
          v-model="state.username"
          inputClass="rounded-10"
          :width="INPUT_WIDTH"
          type="text"
          placeholder="Username"
          required
          :disabled="state.isLoading"
        />
        <InputBase
          v-model="state.password"
          inputClass="rounded-10"
          :width="INPUT_WIDTH"
          type="password"
          placeholder="Password"
          required
          :disabled="state.isLoading"
        />
      </div>

      <div :class="[$style['btn-container'], 'flex gap-12 w-full']">
        <BtnBase
          :btnClass="$style['submit-button']"
          type="submit"
          :label="state.isLoading ? 'Signing in...' : 'Sign in'"
          :disabled="!state.username || !state.password || state.isLoading"
        />
        <BtnBase
          :btnClass="$style['submit-button']"
          :href="$router.resolve({ name: 'Registration' }).href"
          label="Create account"
          :disabled="state.isLoading"
        />
      </div>
    </form>
  </main>
</template>

<style module>
.form {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.title {
  margin-top: 140px;
  margin-bottom: 24px;
}

.error {
  top: 190px;
  padding: 10px;
  margin-bottom: 20px;
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  text-align: center;
  opacity: 50%;
  width: 300px;
}

.btn-container {
  margin-top: 20px;
  width: 300px;
}

.submit-button {
  flex-grow: 1;
  transition: all 0.2s ease;
}
</style>
