<script setup lang="ts">
import { useRouter } from "vue-router";
import InputBase from "@/components/atom/InputBase.vue";
import BtnBase from "@/components/atom/BtnBase.vue";
import { useAuth } from "@/use/useAuth";

const router = useRouter();
const { state, handleSubmit } = useAuth(true);

const handleRegister = () => handleSubmit(router);
</script>

<template>
  <main>
    <form
      :class="$style.form"
      class="flex flex-column items-center"
      @submit.prevent="handleRegister"
    >
      <h3 :class="$style.title">Create account</h3>

      <div v-if="state.error" :class="$style.error">
        {{ state.error }}
      </div>

      <div class="flex flex-column gap-12">
        <InputBase
          v-model="state.username"
          id="username"
          width="300px"
          type="text"
          isBorder
          placeholder="Username"
          required
          :disabled="state.isLoading"
          autocomplete="username"
        />
        <InputBase
          v-model="state.password"
          id="password"
          type="password"
          isBorder
          placeholder="Password"
          required
          :disabled="state.isLoading"
          autocomplete="new-password"
          minlength="6"
        />
      </div>

      <BtnBase
        :class="[$style.submitButton, 'w-full']"
        type="submit"
        :label="state.isLoading ? 'Creating account...' : 'Get Started'"
        :disabled="!state.username || !state.password || state.isLoading"
      />

      <p :class="$style.loginLink">
        Already have an account?
        <router-link to="/login">Sign in</router-link>
      </p>
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

.submitButton {
  margin-top: 20px;
  height: 50px;
  transition: all 0.2s ease;
}

.submitButton:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loginLink {
  margin-top: 16px;
  text-align: center;
  color: var(--text-secondary, #666);
}

.loginLink a {
  color: var(--primary-color, #007bff);
  text-decoration: none;
}

.loginLink a:hover {
  text-decoration: underline;
}
</style>
