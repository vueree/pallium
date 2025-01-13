<script setup lang="ts">
import { useHead } from "@vueuse/head";
import { RouterView } from "vue-router";
import HeaderBase from "@/components/HeaderBase.vue";
import FooterBase from "@/components/FooterBase.vue";
import ErrorNotification from "@/components/ErrorNotification.vue";

useHead({
  link: [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossorigin: "anonymous"
    },
    {
      href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Orbitron:wght@400;500;600;700;800;900&display=swap",
      rel: "stylesheet"
    }
  ]
});
</script>

<template>
  <div :class="['z-1 relative overflow-hidden', $style['app-container']]">
    <HeaderBase />
    <div class="cl_dived" />
    <ErrorNotification />
    <div :class="['absolute', $style.nebula]" />
    <router-view class="max-height mx-auto max-width relative" />
    <div class="cl_dived" />
    <FooterBase />
  </div>
</template>

<style module>
.app-container {
  background-color: black;
  min-height: 100vh;
  perspective: 1000px;
}

.app-container::before,
.app-container::after {
  content: "";
  position: absolute;
  width: var(--size-large);
  height: var(--size-large);
  top: var(--background-position);
  left: var(--background-position);
  background-size: 600px 600px;
  animation: starMove 1000s linear infinite;
}

.app-container::before {
  background-image: radial-gradient(
      1px 1px at 10% 30%,
      rgba(0, 60, 197, var(--gradient-opacity-high)) 1px,
      transparent 1px
    ),
    radial-gradient(
      1px 1px at 20% 50%,
      rgba(11, 99, 246, var(--gradient-opacity-high)) 1px,
      transparent 1px
    ),
    radial-gradient(
      1px 1px at 30% 70%,
      rgba(102, 179, 102, var(--gradient-opacity-high)) 1px,
      transparent 1px
    ),
    radial-gradient(
      2px 2px at 40% 20%,
      rgba(0, 60, 197, var(--gradient-opacity-high)) 1px,
      transparent 2px
    ),
    radial-gradient(
      2px 2px at 50% 40%,
      rgba(11, 99, 246, var(--gradient-opacity-high)) 1px,
      transparent 2px
    ),
    radial-gradient(
      2px 2px at 60% 60%,
      rgba(102, 179, 102, var(--gradient-opacity-high)) 1px,
      transparent 2px
    ),
    radial-gradient(
      2px 2px at 70% 80%,
      rgba(0, 60, 197, var(--gradient-opacity-low)) 1px,
      transparent 2px
    ),
    radial-gradient(
      2px 2px at 80% 10%,
      rgba(11, 99, 246, var(--gradient-opacity-low)) 1px,
      transparent 2px
    ),
    radial-gradient(
      2px 2px at 90% 90%,
      rgba(102, 179, 102, var(--gradient-opacity-low)) 1px,
      transparent 2px
    );
  opacity: 0.8;
}

.app-container::after {
  background-image: radial-gradient(
      2px 2px at 15% 15%,
      rgba(0, 60, 197, var(--gradient-opacity-high)) 1px,
      transparent 2px
    ),
    radial-gradient(
      2px 2px at 35% 45%,
      rgba(11, 99, 246, var(--gradient-opacity-high)) 1px,
      transparent 2px
    ),
    radial-gradient(
      2px 2px at 55% 65%,
      rgba(102, 179, 102, var(--gradient-opacity-high)) 1px,
      transparent 2px
    ),
    radial-gradient(
      2px 2px at 75% 85%,
      rgba(0, 60, 197, var(--gradient-opacity-low)) 1px,
      transparent 2px
    ),
    radial-gradient(
      2px 2px at 95% 25%,
      rgba(11, 99, 246, var(--gradient-opacity-low)) 1px,
      transparent 2px
    );
  background-size: 800px 800px;
  animation-duration: 150s;
  opacity: 0.6;
}

.nebula {
  width: var(--size-large);
  height: var(--size-large);
  top: var(--background-position);
  left: var(--background-position);
  background: radial-gradient(
      circle at 20% 30%,
      rgba(0, 60, 197, var(--nebula-opacity)) 0%,
      transparent 40%
    ),
    radial-gradient(
      circle at 80% 40%,
      rgba(11, 99, 246, 0.15) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 50% 70%,
      rgba(102, 179, 102, var(--nebula-opacity)) 0%,
      transparent 45%
    );
  filter: blur(30px);
  animation: nebulaMove 200s linear infinite;
}

@keyframes starMove {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(-50%, -50%, 0);
  }
}

@keyframes nebulaMove {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(-50%, -50%, 0);
  }
}
</style>
