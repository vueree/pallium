<script setup lang="ts">
import { RouterView } from "vue-router";
import HeaderBase from "./components/HeaderBase.vue";
import FooterBase from "./components/FooterBase.vue";
</script>

<template>
  <HeaderBase />
  <div class="cl_dived" />
  <router-view class="mx-auto max-width max-height" />
  <div class="cl_dived" />
  <FooterBase />
</template>
