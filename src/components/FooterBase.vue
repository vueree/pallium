<template>
  <footer :class="$style['footer-wrapper']">
    <span class="flex mx-auto justify-center">
      &copy; {{ new Date().getFullYear() }} Notes App. All rights reserved.
    </span>
  </footer>
</template>

<style module>
.footer-wrapper {
  padding: 16px;
  max-height: 60px;
  margin-top: auto;
}
</style>
