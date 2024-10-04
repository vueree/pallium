<script setup lang="ts">
import { ref, computed } from "vue";

interface Props {
  modelValue: string;
  type: string;
  name?: string;
  id?: string;
  required?: boolean;
  placeholder?: string;
  minWidth?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  name: "",
  id: "",
  placeholder: "",
  required: false,
  minWidth: "200px"
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
  <div class="input-wrapper">
    <input
      v-model="inputValue"
      :type="type"
      :id="inputId"
      :name="name"
      :placeholder="placeholder"
      :required="required"
      :style="{ minWidth: minWidth, height: '38px' }"
    >
    <slot />
  </input>
  </div>
</template>

<style scoped>
.input-wrapper {
  position: relative;
  width: 100%;

}

.input {
  padding: 0.5rem;
  border: 1px solid #8b7fe5;
  border-radius: 4px;
}

input::placeholder {
  color: #5c5e65;
}

input:focus,
input:not(:placeholder-shown) {
  transform: translateX(2px);
  font-size: 0.95rem;
  color: #333;
}
</style>
