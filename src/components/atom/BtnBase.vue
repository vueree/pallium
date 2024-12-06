<script setup lang="ts">
import { defineProps, defineEmits, withDefaults } from "vue";

interface IProps {
  href?: string;
  target?: string;
  label?: string;
  disabled?: boolean;
  btnClass?: string | string[];
  width?: string;
}

const emit = defineEmits(["update:active"]);

const props = withDefaults(defineProps<IProps>(), {
  isLogin: false,
  href: "",
  target: "_self",
  label: "",
  disabled: false,
  btnClass: ""
});

const handleClick = (event: Event) => {
  if (!props.href && !props.disabled) {
    emit("update:active");
  } else if (props.disabled) {
    event.preventDefault();
  }
};
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    :disabled="!href && disabled"
    :target="href ? target : null"
    :rel="href ? 'noopener noreferrer' : null"
    :width="width"
    :class="[
      btnClass,
      'flex items-center justify-center w-full',
      $style.btn,
      {
        [$style['btn-disabled']]: disabled
      }
    ]"
    @click="handleClick"
  >
    <span class="cl_white text-center">{{ label }}</span>
  </component>
</template>

<style module>
.btn {
  display: inline-flex;
  justify-content: center;
  text-decoration: none;
  transition: 0.5s;
  background-size: 200% auto;
  box-shadow: 0 0 20px #eee;
  border-radius: 10px;
  border: none;
  background-image: linear-gradient(
    to right,
    #003cc5 0%,
    #0b63f6 51%,
    #003cc5 100%
  );
  cursor: pointer;
  height: 50px;
  padding: 0 12px;
  white-space: nowrap;
}

.btn:hover {
  background-position: right center;
}
</style>
