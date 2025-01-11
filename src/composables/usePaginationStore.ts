import { ref } from "vue";
import { defineStore } from "pinia";
import type { Ref } from "vue";

export const usePaginationStore = defineStore("paginationStore", () => {
  const currentPage: Ref<number> = ref(1);
  const totalPages: Ref<number> = ref(1);
  const loading: Ref<boolean> = ref(false);

  const setPagination = (page: number, total: number) => {
    currentPage.value = page;
    totalPages.value = total;
  };

  const resetPagination = () => {
    currentPage.value = 1;
    totalPages.value = 1;
  };

  return {
    currentPage,
    totalPages,
    loading,
    setPagination,
    resetPagination
  };
});
