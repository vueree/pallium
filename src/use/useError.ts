import { useErrorStore } from "../stores/errorStore";

export const useError = () => {
  const errorStore = useErrorStore();

  const showError = (message: string) => {
    errorStore.showError(message);
  };

  return {
    showError
  };
};
