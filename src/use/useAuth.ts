import { ref } from "vue";
import type { Router } from "vue-router";
import { loginUser, registerUser } from "@/use/useChat";

interface AuthState {
  username: string;
  password: string;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = (isRegistration = false) => {
  const state = ref<AuthState>({
    username: "",
    password: "",
    isLoading: false,
    error: null
  });

  const resetForm = () => {
    state.value = {
      username: "",
      password: "",
      isLoading: false,
      error: null
    };
  };

  const validateForm = (): boolean => {
    if (!state.value.username.trim()) {
      state.value.error = "Username is required";
      return false;
    }
    if (!state.value.password.trim()) {
      state.value.error = "Password is required";
      return false;
    }
    if (state.value.password.length < 6) {
      state.value.error = "Password must be at least 6 characters";
      return false;
    }
    return true;
  };

  const handleSubmit = async (router: Router) => {
    try {
      if (!validateForm()) return;

      state.value.isLoading = true;
      state.value.error = null;

      if (isRegistration) {
        await registerUser(state.value.username, state.value.password, router);
      } else {
        await loginUser(state.value.username, state.value.password, router);
      }

      resetForm();
    } catch (error) {
      state.value.error =
        error?.response?.data?.message ||
        `${isRegistration ? "Registration" : "Login"} failed`;
      console.error(
        `${isRegistration ? "Registration" : "Login"} error:`,
        error
      );
    } finally {
      state.value.isLoading = false;
    }
  };

  return {
    state,
    handleSubmit,
    resetForm
  };
};
