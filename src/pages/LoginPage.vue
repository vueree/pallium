<script setup lang="ts">
import { useRouter } from "vue-router";
import InputBase from "@/components/atom/InputBase.vue";
import BtnBase from "@/components/atom/BtnBase.vue";
import { useAuth } from "@/use/useAuth";

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
      <h3 :class="$style.title">Welcome!</h3>

      <div v-if="state.error" :class="$style.error">
        {{ state.error }}
      </div>

      <div class="flex flex-column gap-12">
        <InputBase
          v-model="state.username"
          width="300px"
          type="text"
          isBorder
          placeholder="Username"
          required
          :disabled="state.isLoading"
        />
        <InputBase
          v-model="state.password"
          type="password"
          isBorder
          placeholder="Password"
          required
          :disabled="state.isLoading"
        />
      </div>

      <div :class="[$style.btnContainer, 'flex gap-12 w-full']">
        <BtnBase
          :class="$style.submitButton"
          type="submit"
          :label="state.isLoading ? 'Signing in...' : 'Sign in'"
          :disabled="!state.username || !state.password || state.isLoading"
        />
        <BtnBase
          :btnClass="$style.submitButton"
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
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary, #333);
}

.error {
  padding: 10px;
  margin-bottom: 20px;
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  text-align: center;
  width: 100%;
}

.btnContainer {
  width: 300px;
  margin-top: 20px;
}

.submitButton {
  flex-grow: 1;
  transition: all 0.2s ease;
}

.submitButton:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
