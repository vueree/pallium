<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import InputBase from "@/components/atom/InputBase.vue";
import BtnBase from "@/components/atom/BtnBase.vue";
import type { State, InputField } from "@/types";

const props = defineProps<{
  mode: "login" | "register";
  title: string;
}>();

const router = useRouter();
const { state, handleSubmit, isFormValid } = useAuth();

const inputFields: InputField[] = [
  {
    model: "username",
    type: "text",
    placeholder: "Username",
    autocomplete: "username",
    minlength: undefined
  },
  {
    model: "password",
    type: "password",
    placeholder: "Password",
    autocomplete:
      props.mode === "register" ? "new-password" : "current-password",
    minlength: 6
  }
];

const handleInputChange = (
  field: keyof Pick<State, "username" | "password">,
  value: string
) => {
  state.value[field] = value;
};

const handleFormSubmit = async () => {
  try {
    await handleSubmit(props.mode, router);
    router.push("/chat");
  } catch (error) {
    console.error(error);
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
    :class="['z-2 flex flex-column items-center relative', $style.form]"
    @submit.prevent="handleFormSubmit"
  >
    <h3 class="title">{{ title }}</h3>

    <div class="flex flex-column gap-12">
      <InputBase
        v-for="(field, index) in inputFields"
        :key="index"
        :modelValue="state[field.model]"
        :type="field.type"
        :placeholder="field.placeholder"
        :required="true"
        :disabled="state.isLoading"
        :autocomplete="field.autocomplete"
        :minlength="field.minlength"
        @update:modelValue="(value: string) => handleInputChange(field.model, value)"
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
        v-if="props.mode === 'login'"
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
