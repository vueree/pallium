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
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false
      },
      "/socket.io": {
        target: "http://localhost:3000", // Corrected target for Socket.IO
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  }
});
