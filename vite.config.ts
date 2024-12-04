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
    outDir: "dist", // папка, куда Vite будет собирать проект
    rollupOptions: {
      input: path.resolve(__dirname, "index.html")
    }
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000", // проксируем API запросы на сервер
        changeOrigin: true,
        secure: false
      },
      "/socket.io": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  }
});
