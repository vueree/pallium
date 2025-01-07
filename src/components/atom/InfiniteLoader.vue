<script setup lang="ts">
import { ref, onUnmounted } from "vue";
import { useIntersectionObserver } from "@vueuse/core";

const props = defineProps<{
  isFetching: boolean;
  currentPage: number;
  lastPage: number;
}>();

const emit = defineEmits<{
  (e: "fetch"): void;
}>();

const sentinel = ref<HTMLElement | null>(null);

const { stop } = useIntersectionObserver(
  sentinel,
  ([{ isIntersecting }]) => {
    if (
      isIntersecting &&
      !props.isFetching &&
      props.currentPage < props.lastPage
    ) {
      emit("fetch");
    }
  },
  { threshold: 0.5 }
);

onUnmounted(() => {
  stop();
});
</script>

<template>
  <div ref="sentinel" class="sentinel">
    <slot />
  </div>
</template>

<style scoped>
.sentinel {
  width: 100%;
  height: 20px;
}
</style>
