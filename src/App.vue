<script setup lang="ts">
import { RouterView } from "vue-router";
import HeaderBase from "@/components/HeaderBase.vue";
import FooterBase from "@/components/FooterBase.vue";
import ErrorNotification from "@/components/ErrorNotification.vue";
import { useHead } from "@vueuse/head";

useHead({
  link: [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossorigin: "anonymous"
    },
    {
      href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Orbitron:wght@400;500;600;700&display=swap",
      rel: "stylesheet"
    }
  ]
});
</script>

<template>
  <div :class="$style['app-container']">
    <HeaderBase />
    <div class="cl_dived" />
    <ErrorNotification />
    <router-view :class="['mx-auto max-width', $style['chat-area-wrapper']]" />
    <div class="cl_dived" />
    <FooterBase />
  </div>
</template>

<style>
@import "@/assets/styles/typography.css";

#app {
  font-family: var(--font-primary);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>

<style module>
.app-container {
  background-color: black;
  z-index: 1;
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  perspective: 1000px;
}

.app-container::before {
  content: "";
  position: absolute;
  width: 400%;
  height: 400%;
  top: -150%;
  left: -150%;
  background-image: radial-gradient(
      1px 1px at 10% 30%,
      rgba(0, 60, 197, 0.9) 1px,
      transparent 1px
    ),
    radial-gradient(
      1px 1px at 20% 50%,
      rgba(11, 99, 246, 0.9) 1px,
      transparent 1px
    ),
    radial-gradient(
      1px 1px at 30% 70%,
      rgba(102, 179, 102, 0.9) 1px,
      transparent 1px
    ),
    radial-gradient(
      2px 2px at 40% 20%,
      rgba(0, 60, 197, 0.9) 1px,
      transparent 2px
    ),
    radial-gradient(
      2px 2px at 50% 40%,
      rgba(11, 99, 246, 0.9) 1px,
      transparent 2px
    ),
    radial-gradient(
      2px 2px at 60% 60%,
      rgba(102, 179, 102, 0.9) 1px,
      transparent 2px
    ),
    radial-gradient(
      2px 2px at 70% 80%,
      rgba(0, 60, 197, 0.8) 1px,
      transparent 2px
    ),
    radial-gradient(
      2px 2px at 80% 10%,
      rgba(11, 99, 246, 0.8) 1px,
      transparent 2px
    ),
    radial-gradient(
      2px 2px at 90% 90%,
      rgba(102, 179, 102, 0.8) 1px,
      transparent 2px
    );
  background-size: 600px 600px;
  animation: starMove 100s linear infinite;
  opacity: 0.8;
}

.app-container::after {
  content: "";
  position: absolute;
  width: 400%;
  height: 400%;
  top: -150%;
  left: -150%;
  background-image: radial-gradient(
      2px 2px at 15% 15%,
      rgba(0, 60, 197, 0.9) 1px,
      transparent 2px
    ),
    radial-gradient(
      2px 2px at 35% 45%,
      rgba(11, 99, 246, 0.9) 1px,
      transparent 2px
    ),
    radial-gradient(
      2px 2px at 55% 65%,
      rgba(102, 179, 102, 0.9) 1px,
      transparent 2px
    ),
    radial-gradient(
      2px 2px at 75% 85%,
      rgba(0, 60, 197, 0.8) 1px,
      transparent 2px
    ),
    radial-gradient(
      2px 2px at 95% 25%,
      rgba(11, 99, 246, 0.8) 1px,
      transparent 2px
    );
  background-size: 800px 800px;
  animation: starMove 150s linear infinite;
  opacity: 0.6;
}

.nebula {
  position: absolute;
  width: 400%;
  height: 400%;
  top: -150%;
  left: -150%;
  background: radial-gradient(
      circle at 20% 30%,
      rgba(0, 60, 197, 0.2) 0%,
      transparent 40%
    ),
    radial-gradient(
      circle at 80% 40%,
      rgba(11, 99, 246, 0.15) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 50% 70%,
      rgba(102, 179, 102, 0.2) 0%,
      transparent 45%
    );
  filter: blur(30px);
  animation: nebulaMove 200s linear infinite;
}

@keyframes starMove {
  0% {
    transform: translateZ(0) translate3d(0, 0, 0);
  }
  100% {
    transform: translateZ(0) translate3d(-50%, -50%, 0);
  }
}

@keyframes nebulaMove {
  0% {
    transform: translateZ(0) translate3d(0, 0, 0);
  }
  100% {
    transform: translateZ(0) translate3d(-50%, -50%, 0);
  }
}

.chat-area-wrapper {
  height: calc(100vh - 120px);
  position: relative;
}
</style>
