<script setup lang="ts">
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import Cookies from "js-cookie";
import { useSocketStore } from "@/stores/socket.store";
import { AUTH_TOKEN_KEY } from "@/constants";

const router = useRouter();

const webSocketStore = useSocketStore();
const { isConnected } = storeToRefs(webSocketStore);

const handleLogout = () => {
  router.push({ name: "Login" });
  Cookies.remove(AUTH_TOKEN_KEY, {
    path: "/",
    domain: "http://localhost:3000",
  });
  localStorage.removeItem("username");
};
</script>

<template>
  <header class="z-2 flex items-center justify-between w-full mx-auto relative">
    <a
      class="pointer text-decoration-none app-logo"
      @click.prevent="handleLogout"
    >
      P A L L I U M
    </a>
    <span
      :class="[
        'status-text relative overflow-hidden',
        $style.status,
        isConnected
          ? ['cl_green', $style['connected']]
          : ['cl_red', $style['disconnected']],
      ]"
      >{{ isConnected ? "С O N N E C T E D" : "D I S C O N N E C T E D" }}</span
    >
  </header>
</template>

<style module>
a {
  color: transparent;
  text-decoration: none;
  background-image: linear-gradient(90deg, #003cc5, #0b63f6, #66b366);
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  transition: background-position 1s ease;
}

a:hover {
  background-position: right center;
}

.status {
  margin-left: 10px;
  display: inline-block;
  cursor: default;
}

.connected {
  color: var(--color-green);
  animation: colorChange 10s ease-in-out infinite,
    electricityEffect 13s ease-in-out infinite;
}

.disconnected {
  color: var(--color-red);
  text-shadow: 0.05em 0 0 rgba(255, 0, 0, 0.75),
    -0.025em -0.05em 0 rgba(0, 255, 0, 0.75),
    0.025em 0.05em 0 rgba(0, 0, 255, 0.75);
  animation: glitch 500ms infinite, vhsNoise 2s infinite linear,
    vhsShake 1522ms infinite, vhsScanlines 18s linear infinite;
  opacity: 50%;
}

.disconnected::before,
.disconnected::after {
  content: "D I S C O N N E C T E D";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  clip: rect(0, 900px, 0, 0);
}

.disconnected::before {
  left: var(--glitch-offset);
  text-shadow: -2px 0 #ff0000;
  animation: glitch-anim 2s infinite linear alternate-reverse;
}

.disconnected::after {
  left: calc(var(--glitch-offset) * -1);
  text-shadow: 2px 0 #00ff00;
  animation: glitch-anim 3s infinite linear alternate-reverse;
}

@keyframes colorChange {
  0% {
    color: rgba(102, 179, 102, 0.5);
  }
  50% {
    color: var(--color-green);
  }
  100% {
    color: rgba(102, 179, 102, 0.5);
  }
}

@keyframes electricityEffect {
  0%,
  100% {
    filter: none;
  }
  20% {
    filter: contrast(1.5) brightness(1.2) hue-rotate(20deg);
  }
  40% {
    filter: contrast(2) brightness(0.5) hue-rotate(40deg);
  }
  60% {
    filter: contrast(1.5) brightness(1.5) hue-rotate(-20deg);
  }
  80% {
    filter: contrast(2) brightness(0.5) hue-rotate(40deg);
  }
}

@keyframes glitch {
  0% {
    transform: translate(0);
  }
  20% {
    transform: translate(-2px, 2px);
  }
  40% {
    transform: translate(-2px, -2px);
  }
  60% {
    transform: translate(2px, 2px);
  }
  80% {
    transform: translate(2px, -2px);
  }
  100% {
    transform: translate(0);
  }
}

@keyframes glitch-anim {
  0% {
    clip: rect(44px, 9999px, 44px, 0);
  }
  5% {
    clip: rect(12px, 9999px, 59px, 0);
  }
  10% {
    clip: rect(48px, 9999px, 29px, 0);
  }
  15% {
    clip: rect(42px, 9999px, 73px, 0);
  }
  20% {
    clip: rect(63px, 9999px, 27px, 0);
  }
  25% {
    clip: rect(34px, 9999px, 55px, 0);
  }
  30% {
    clip: rect(86px, 9999px, 73px, 0);
  }
  35% {
    clip: rect(20px, 9999px, 20px, 0);
  }
  40% {
    clip: rect(26px, 9999px, 60px, 0);
  }
  45% {
    clip: rect(25px, 9999px, 66px, 0);
  }
  50% {
    clip: rect(57px, 9999px, 98px, 0);
  }
  55% {
    clip: rect(5px, 9999px, 46px, 0);
  }
  60% {
    clip: rect(82px, 9999px, 31px, 0);
  }
  65% {
    clip: rect(54px, 9999px, 27px, 0);
  }
  70% {
    clip: rect(28px, 9999px, 99px, 0);
  }
  75% {
    clip: rect(45px, 9999px, 69px, 0);
  }
  80% {
    clip: rect(23px, 9999px, 85px, 0);
  }
  85% {
    clip: rect(54px, 9999px, 84px, 0);
  }
  90% {
    clip: rect(45px, 9999px, 47px, 0);
  }
  95% {
    clip: rect(37px, 9999px, 20px, 0);
  }
  100% {
    clip: rect(4px, 9999px, 91px, 0);
  }
}

@keyframes vhsNoise {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 100% 100%;
  }
}

@keyframes vhsShake {
  0% {
    transform: translate(0, 0) skew(0deg);
  }
  25% {
    transform: translate(2px, 2px) skew(1deg);
  }
  75% {
    transform: translate(-2px, -2px) skew(-1deg);
  }
  100% {
    transform: translate(0, 0) skew(0deg);
  }
}

@keyframes vhsScanlines {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 0 100%;
  }
}

.disconnected::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent 50%,
    rgba(0, 0, 0, 0.5) 51%
  );
  background-size: 100% 4px;
  pointer-events: none;
}
</style>
