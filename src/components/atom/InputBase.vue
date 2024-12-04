<script setup lang="ts">
import { ref, computed } from "vue";

interface Props {
  modelValue: string;
  type: string;
  name?: string;
  id?: string;
  required?: boolean;
  placeholder?: string;
  width?: string;
  isBorder?: boolean;
  isLogin?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  name: "",
  id: "",
  placeholder: "",
  required: false,
  width: "200px",
  isLogin: false
});

const emit = defineEmits(["update:modelValue"]);

const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value)
});

const inputId = computed(
  () => props.id || `input-${Math.random().toString(36).substr(2, 9)}`
);
</script>

<template>
  <div
    :class="[
      $style['input-wrapper'],
      {
        [$style['is-border']]: isBorder
      },
      'flex items-center relative'
    ]"
  >
    <div></div>
    <input
      v-model="inputValue"
      :class="$style.input"
      :style="{ width: width, height: '26px' }"
      :type="type"
      :id="inputId"
      :name="name"
      :placeholder="placeholder"
      :required="required"
    />
    <slot :class="$style.slot" />
  </div>
</template>

<style module>
.input-wrapper {
  position: relative;
  min-height: 60px;
}

.input {
  padding: 8px;
  border: none;
}

.input::placeholder {
  color: #797b85;
  opacity: 50%;
}

.slot {
  margin-top: auto;
}

.is-border {
  border: 1px solid #8189b7;
  border-radius: 10px;
}
</style>
