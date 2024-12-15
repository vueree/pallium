<script lang="ts" setup async="async">
import SimpleBar from "simplebar";
import "simplebar/dist/simplebar.min.css";
import { ref, onMounted, defineExpose, defineProps, withDefaults } from "vue";
import type { ComponentPublicInstance } from "vue";

export interface SimpleBarAPI extends ComponentPublicInstance {
  scrollElement: HTMLDivElement;
}

interface Props {
  options?: ConstructorParameters<typeof SimpleBar>[0];
  offset?: number | string;
  contentClass?:
    | string
    | Record<string, boolean>
    | (string | Record<string, boolean>)[];
}

const props = withDefaults(defineProps<Props>(), {
  options: undefined,
  offset: 0,
  contentClass: ""
});

const emit = defineEmits(["mounted"]);

const element = ref<HTMLElement | null>(null);
const scrollElement = ref<HTMLDivElement | null>(null);
const simpleBar = ref<SimpleBar | null>(null);

defineExpose({ scrollElement: scrollElement.value });

onMounted(() => {
  if (element.value) {
    simpleBar.value = new SimpleBar(element.value, props.options);
    scrollElement.value = element.value.querySelector(
      ".simplebar-content-wrapper"
    ) as HTMLDivElement;
    emit("mounted", scrollElement.value);
  }
});
</script>

<template>
  <div ref="element" :class="['full-width full-height']">
    <div class="simplebar-wrapper">
      <div class="simplebar-height-auto-observer-wrapper">
        <div class="simplebar-height-auto-observer" />
      </div>
      <div class="simplebar-mask">
        <div class="simplebar-offset">
          <div ref="scrollElement" class="simplebar-content-wrapper">
            <div
              ref="contentElement"
              class="simplebar-content"
              :class="contentClass"
            >
              <slot v-bind="{ scrollElement }"></slot>
            </div>
          </div>
        </div>
      </div>
      <div class="simplebar-placeholder" />
    </div>
    <div class="simplebar-track simplebar-horizontal">
      <div class="simplebar-scrollbar" />
    </div>
    <div
      class="simplebar-track simplebar-vertical"
      :style="{ top: `${offset}px`, bottom: `${offset}px` }"
    >
      <div class="simplebar-scrollbar" />
    </div>
  </div>
</template>

<style>
.simplebar-scrollbar::before {
  right: 0;
  left: 0;
  background: rgb(var(--color_blue-light-steel));
}

.simplebar-visible::before {
  opacity: 1;
}

.simplebar-track.simplebar-vertical {
  right: 8px;
  width: 4px;
}
</style>
