<script lang="ts" setup>
import { ref, toRefs, onUnmounted } from "vue";
import { useIntersectionObserver, MaybeElementRef } from "@vueuse/core";

interface IProps {
  root?: MaybeElementRef | (() => null);
  distance?: number | string;
}

const props = withDefaults(defineProps<IProps>(), {
  root: null,
  distance: 0
});

const emit = defineEmits(["intersection"]);

const { root } = toRefs(props);

const target = ref<MaybeElementRef>(null);

const resolvedRoot =
  typeof root.value === "function" ? root.value() : root.value;

const { stop } = useIntersectionObserver(
  target,
  ([{ isIntersecting }]) => {
    console.log("Intersection detected:", isIntersecting);
    if (!isIntersecting) return;

    emit("intersection");
  },
  { root: resolvedRoot, rootMargin: `${props.distance}px` }
);

onUnmounted(stop);
</script>

<template>
  <div ref="target">
    <slot />
  </div>
</template>
