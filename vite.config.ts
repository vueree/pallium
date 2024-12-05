import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  build: {
    outDir: "dist"
  },
  base: "/",
  server: {
    port: 5173,
    proxy: {
      "/auth": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/auth/, "/auth")
      },
      "/chat": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/chat/, "/chat")
      },
      "/socket.io": {
        target: "http://localhost:3000",
        ws: true,
        changeOrigin: true
      }
    }
  }
});
