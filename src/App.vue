<script setup lang="ts">
import { RouterView } from "vue-router";
import HeaderBase from "./components/HeaderBase.vue";
import FooterBase from "./components/FooterBase.vue";
</script>

<template>
  <HeaderBase />
  <router-view />
  <FooterBase />
</template>
