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
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  name: "",
  id: "",
  placeholder: "",
  required: false,
  width: "200px"
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
  <div :class="[$style['input-wrapper'], 'flex items-center relative']">
    <input
      v-model="inputValue"
      :style="{ width: width, height: '26px' }"
      :class="$style.input"
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
  padding: 8px 0;
  border: none;
}

.input::placeholder {
  color: #797b85;
}

.slot {
  margin-top: auto;
}
</style>
