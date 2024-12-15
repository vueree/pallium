<script lang="ts" setup async="async">
import { computed } from "vue";

interface Props {
  currentPage: number;
  lastPage: number;
  isFetching: boolean;
  root?: HTMLElement | null;
  distance?: number | string;
  spinnerSize?: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  root: null,
  distance: 200,
  spinnerSize: 30
});

const emit = defineEmits(["fetch"]);

const isFinished = computed(() => props.currentPage === props.lastPage);

const onIntersection = () =>
  !isFinished.value && !props.isFetching && !props.disabled && emit("fetch");
</script>

<template>
  <IntersectionObserver
    v-show="!isFinished || isFetching"
    v-bind="{ root, distance }"
    class="flex justify-center items-center"
    style="height: 100px"
    @intersection="onIntersection"
  >
    <slot />
  </IntersectionObserver>
</template>
