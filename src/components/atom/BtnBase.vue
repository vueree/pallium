<script setup lang="ts">
import { defineProps, defineEmits, withDefaults } from "vue";

interface IProps {
  to?: { name: string } | string;
  target?: string;
  label?: string;
  disabled?: boolean;
  btnClass?: string | string[];
  width?: string;
  type?: "button" | "submit" | "reset";
}

const emit = defineEmits(["update:active"]);

const props = withDefaults(defineProps<IProps>(), {
  to: undefined,
  target: "_self",
  label: "",
  disabled: false,
  btnClass: "",
  width: "",
  type: "button"
});

const handleClick = (event: Event) => {
  if (!props.to && !props.disabled) {
    emit("update:active");
  } else if (props.disabled) {
    event.preventDefault();
  }
};
</script>

<template>
  <component
    :is="to ? 'router-link' : 'button'"
    :to="to"
    :type="!to ? type : undefined"
    :disabled="disabled"
    :target="to ? target : undefined"
    :rel="to ? 'noopener noreferrer' : undefined"
    :style="{ width }"
    :class="[
      btnClass,
      'flex items-center justify-center w-full pointer rounded-10 justify-center',
      $style.btn,
      { [$style['btn-disabled']]: disabled }
    ]"
    @click="handleClick"
  >
    <span class="cl_white text-center">{{ label }}</span>
  </component>
</template>

<style module>
.btn {
  display: inline-flex;
  text-decoration: none;
  transition: 0.5s;
  background-size: 200% auto;
  box-shadow: 0 0 20px #eee;
  border: none;
  background-image: linear-gradient(
    to right,
    #003cc5 0%,
    #0b63f6 51%,
    #003cc5 100%
  );
  height: 50px;
  padding: 0 12px;
  white-space: nowrap;
}

.btn:hover:not(.btn-disabled) {
  background-position: right center;
}

.btn-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: hsl(220, 29%, 59%) !important;
  background-image: none !important;
  box-shadow: none;
}
</style>
