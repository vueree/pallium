<script setup lang="ts">
import { useRouter } from "vue-router";
import InputBase from "@/components/atom/InputBase.vue";
import BtnBase from "@/components/atom/BtnBase.vue";
import { useAuth } from "@/use/useAuth";
import { useError } from "@/use/useError";
import { INPUT_WIDTH } from "@/use/useChat";

const props = defineProps<{
  mode: "login" | "register";
  title: string;
}>();

const router = useRouter();
const { state, handleSubmit, isFormValid } = useAuth();
const { showError } = useError();

const handleFormSubmit = async () => {
  try {
    await handleSubmit(props.mode, router);
    await router.push({ name: "Chat" });
  } catch (error) {
    showError(error instanceof Error ? error.message : "An error occurred");
  }
};

const getButtonLabel = () => {
  if (state.value.isLoading) {
    return props.mode === "login" ? "Signing in..." : "Creating account...";
  }
  return props.mode === "login" ? "Sign in" : "Get Started";
};
</script>

<template>
  <form
    :class="$style.form"
    class="flex flex-column items-center"
    @submit.prevent="handleFormSubmit"
  >
    <h3 class="title">{{ title }}</h3>

    <div class="flex flex-column gap-12">
      <InputBase
        v-model="state.username"
        inputClass="rounded-10"
        :width="String(INPUT_WIDTH)"
        type="text"
        placeholder="Username"
        required
        :disabled="state.isLoading"
        autocomplete="username"
      />
      <InputBase
        v-model="state.password"
        inputClass="rounded-10"
        :width="String(INPUT_WIDTH)"
        type="password"
        placeholder="Password"
        required
        :disabled="state.isLoading"
        :autocomplete="
          mode === 'register' ? 'new-password' : 'current-password'
        "
        minlength="6"
      />
    </div>

    <div :class="[$style['btn-container'], 'flex gap-12 w-full']">
      <BtnBase
        :btnClass="$style['submit-button']"
        type="submit"
        :label="getButtonLabel()"
        :disabled="!isFormValid"
      />
      <BtnBase
        v-if="mode === 'login'"
        :btnClass="$style['submit-button']"
        :to="{ name: 'Registration' }"
        label="Create account"
        :disabled="state.isLoading"
      />
    </div>
  </form>
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

.btn-container {
  margin-top: 20px;
  width: 300px;
}

.submit-button {
  flex-grow: 1;
  transition: all 0.2s ease;
}
</style>
