import { defineStore } from "pinia";
import Cookies from "js-cookie";
import apiClient from "@/api/api";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: { id: string; name: string } | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    accessToken: null,
    refreshToken: null,
    user: null
  }),

  actions: {
    async login(credentials: { email: string; password: string }) {
      try {
        const response = await apiClient.post("/auth/login", credentials);
        const { accessToken, refreshToken, user } = response.data;

        Cookies.set("access_token", accessToken);
        Cookies.set("refresh_token", refreshToken);

        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.user = user;

        return user;
      } catch (error) {
        console.error("Ошибка авторизации:", error);
        throw error;
      }
    },

    async updateAccessToken() {
      try {
        const response = await apiClient.post("/auth/refresh", {
          refreshToken: this.refreshToken
        });
        const { accessToken } = response.data;

        Cookies.set("access_token", accessToken);
        this.accessToken = accessToken;

        return accessToken;
      } catch (error) {
        console.error("Ошибка обновления токена:", error);
        throw error;
      }
    },

    logout() {
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
      this.accessToken = null;
      this.refreshToken = null;
      this.user = null;
    }
  }
});
