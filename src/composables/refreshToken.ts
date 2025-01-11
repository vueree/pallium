import axios from "axios";
import Cookies from "js-cookie";

export const refreshToken = () => {
  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      const refreshToken = Cookies.get("refresh_token");
      if (!refreshToken) {
        throw new Error("Refresh token отсутствует");
      }

      const response = await axios.post<{ accessToken: string }>(
        `${import.meta.env.VITE_API_URL}/auth/refresh`,
        { refreshToken }
      );

      const newAccessToken = response.data.accessToken;

      if (newAccessToken) {
        Cookies.set("access_token", newAccessToken, {
          secure: true,
          sameSite: "strict"
        });
        return newAccessToken;
      }

      throw new Error("Не удалось обновить токен доступа");
    } catch (error) {
      console.error("Ошибка обновления токена доступа:", error);
      return null;
    }
  };

  return {
    refreshAccessToken
  };
};
