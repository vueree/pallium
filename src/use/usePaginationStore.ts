import { ref } from "vue";
import { defineStore } from "pinia";

export const usePaginationStore = defineStore("paginationStore", () => {
  const currentPage = ref(1); // Текущая страница пагинации
  const totalPages = ref(0); // Общее количество страниц
  const loading = ref(false); // Состояние загрузки

  // Установка пагинации
  const setPagination = (page: number, total: number) => {
    currentPage.value = page;
    totalPages.value = total;
  };

  // Сброс пагинации
  const resetPagination = () => {
    currentPage.value = 1;
    totalPages.value = 0;
  };

  return {
    currentPage,
    totalPages,
    loading,
    setPagination,
    resetPagination
  };
});
