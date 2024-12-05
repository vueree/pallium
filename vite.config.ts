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
    outDir: "./dist",
    rollupOptions: {
      input: path.resolve(__dirname, "index.html")
    }
  },
  server: {
    proxy: {
      "/auth": {
        target: "https://api-pallium.onrender.com", // или http://localhost:3000 для локальной разработки
        changeOrigin: true
      },
      "/chat": {
        target: "https://api-pallium.onrender.com", // или http://localhost:3000 для локальной разработки
        changeOrigin: true
      },
      "/socket.io": {
        target: "https://api-pallium.onrender.com", // или http://localhost:3000 для локальной разработки
        changeOrigin: true,
        ws: true
      }
    }
  }
});
