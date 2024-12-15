<script lang="ts" setup>
import { ref, toRefs, onUnmounted } from "vue";
import { useIntersectionObserver, MaybeElementRef } from "@vueuse/core";

interface Props {
  root?: MaybeElementRef | (() => null);
  distance?: number | string;
}

const props = withDefaults(defineProps<Props>(), {
  root: () => null,
  distance: 0
});

const emit = defineEmits(["intersection"]);

const { root } = toRefs(props);

const target = ref<MaybeElementRef>(null);

const { stop } = useIntersectionObserver(
  target,
  ([{ isIntersecting }]) => {
    console.log("Intersection detected:", isIntersecting);
    if (!isIntersecting) return;

    emit("intersection");
  },
  { root, rootMargin: `${props.distance}px` }
);

onUnmounted(stop);
</script>

<template>
  <div ref="target">
    <slot />
  </div>
</template>
