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
      "/api": {
        // target: "http://localhost:3000",
        target: "https://api-pallium.onrender.com",
        changeOrigin: true
      },
      "/socket.io": {
        // target: "http://localhost:3000",
        target: "https://api-pallium.onrender.com",
        changeOrigin: true,
        ws: true
      }
    }
    // fs: {
    //   strict: true // Ограничивает доступ к файлам вне корневой директории
    // },
    // hmr: {
    //   overlay: false // Отключает автоматический перезапуск клиента
    // },
    // middlewareMode: false // Отключает режим middleware
  }
});
