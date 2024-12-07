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
  inputClass?: string;
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
  <div class="flex items-center relative">
    <input
      v-model="inputValue"
      :class="[$style.input, inputClass]"
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
.slot {
  margin-top: auto;
}

.input {
  padding: 6px 8px;
}
</style>
