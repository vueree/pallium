import { defineStore } from "pinia";
import { ref } from "vue";

export const useErrorStore = defineStore("error", () => {
  const error = ref<string | null>(null);
  const isVisible = ref(false);

  const showError = (message: string) => {
    error.value = message;
    isVisible.value = true;

    setTimeout(() => {
      hideError();
    }, 5000);
  };

  const hideError = () => {
    error.value = null;
    isVisible.value = false;
  };

  return {
    error,
    isVisible,
    showError,
    hideError
  };
});
