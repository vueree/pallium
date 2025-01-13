<script setup lang="ts">
interface IProps {
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

withDefaults(defineProps<IProps>(), {
  type: "text",
  name: "",
  id: "",
  placeholder: "",
  required: false,
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
      class="input-text rounded-10 cl_text-light"
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
