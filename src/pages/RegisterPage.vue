<script setup lang="ts">
import { useRouter } from "vue-router";
import InputBase from "@/components/atom/InputBase.vue";
import BtnBase from "@/components/atom/BtnBase.vue";
import { useAuth } from "@/use/useAuth";
import { INPUT_WIDTH } from "@/use/useChat";

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
      <h3 class="title">Create account</h3>

      <div v-if="state.error" :class="[$style.error, 'absolute rounded-10']">
        {{ state.error }}
      </div>

      <div class="flex flex-column gap-12">
        <InputBase
          v-model="state.username"
          id="username"
          inputClass="rounded-10"
          :width="INPUT_WIDTH"
          type="text"
          placeholder="Username"
          required
          :disabled="state.isLoading"
          autocomplete="username"
        />
        <InputBase
          v-model="state.password"
          id="password"
          type="password"
          inputClass="rounded-10"
          :width="INPUT_WIDTH"
          placeholder="Password"
          required
          :disabled="state.isLoading"
          autocomplete="new-password"
          minlength="6"
        />
      </div>

      <BtnBase
        :class="[$style['submit-button'], 'w-full']"
        type="submit"
        :label="state.isLoading ? 'Creating account...' : 'Get Started'"
        :disabled="!state.username || !state.password || state.isLoading"
      />
    </form>
  </main>
</template>

<style module>
.form {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.error {
  top: 190px;
  padding: 10px;
  margin-bottom: 20px;
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  text-align: center;
  opacity: 50%;
  width: 300px;
}

.submit-button {
  margin-top: 20px;
  transition: all 0.2s ease;
  max-width: 300px;
}
</style>
