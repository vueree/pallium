<template>
  <footer :class="[$style['footer-wrapper'], 'mt-auto']">
    <span class="flex mx-auto justify-center">
      &copy; {{ new Date().getFullYear() }} Notes App. All rights reserved.
    </span>
  </footer>
</template>

<style module>
.footer-wrapper {
  padding: 16px;
  height: 28px;
}
</style>
