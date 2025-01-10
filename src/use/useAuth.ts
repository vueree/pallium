import { ref, computed } from "vue";
import type { Router } from "vue-router";
import { registerUser, loginUser } from "@/use/useChat";
import type { AuthState, AuthMode } from "@/types/";

export const useAuth = () => {
  const state = ref<AuthState>({
    username: "",
    password: "",
    isLoading: false,
    error: null
  });

  const isFormValid = computed(() => {
    return state.value.username.length > 0 && state.value.password.length >= 6;
  });

  const resetForm = () => {
    state.value = {
      username: "",
      password: "",
      isLoading: false,
      error: null
    };
  };

  const handleSubmit = async (mode: AuthMode, router: Router) => {
    state.value.isLoading = true;
    state.value.error = null;

    try {
      const credentials = {
        username: state.value.username,
        password: state.value.password
      };

      if (mode === "login") {
        await loginUser(credentials);
        resetForm();
        await router.push({ name: "Chat" });
      } else {
        await registerUser(credentials);
        resetForm();
        await router.push({ name: "Chat" });
      }
    } catch (error) {
      throw error;
    } finally {
      state.value.isLoading = false;
    }
  };

  return {
    state,
    handleSubmit,
    isFormValid
  };
};
