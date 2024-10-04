<script setup lang="ts">
import { defineEmits, defineProps } from "vue";

const emit = defineEmits(["update:active"]);
const props = defineProps({
  label: {
    type: String,
    default: "Send"
  },
  disabled: {
    type: Boolean,
    default: false
  },
  width: {
    type: String,
    default: "20px"
  }
});

const handleClick = () => {
  if (!props.disabled) {
    emit("update:active");
  }
};
</script>

<template>
  <button
    :class="$style['magic-border-button']"
    :style="{ minWidth: width }"
    :disabled="disabled"
    @click="handleClick"
  >
    <span :class="$style['magic-border-button__text']">{{ props.label }}</span>
  </button>
</template>

<style module>
.magic-border-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 20px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  min-height: 40px;
  cursor: pointer;
  border: none;
  outline: none;
  overflow: hidden;
  transition: all 0.3s ease;
  background-color: #ff6fd8;
}

.magic-border-button::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 300%;
  height: 100%;
  background: linear-gradient(90deg, #ff6fd8, #6f86ff, #ff6fd8);
  transition: all 0.4s ease;
  z-index: 0;
}

.magic-border-button:hover::before {
  left: 0;
  transition: all 0.4s ease;
}

.magic-border-button__text {
  z-index: 1;
  color: white;
  position: relative;
}
</style>
