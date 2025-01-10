<script setup lang="ts">
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
  disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  type: "text",
  name: "",
  id: "",
  placeholder: "",
  required: false,
  width: "200px",
  isLogin: false
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <div class="flex items-center relative">
    <input
      :value="modelValue"
      :class="[inputClass, $style.input]"
      :style="{ width }"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="(e) => {
    const target = e.target as HTMLInputElement;
    if (target) {
      emit('update:modelValue', target.value);
    }
  }"
    />
  </div>
</template>

<style module>
.input {
  padding: 6px 8px;
}
</style>
