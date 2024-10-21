import { ref } from "vue";
import axios from "axios";
import type { IMessage } from "../types";

const API_URL = "http://localhost:3000/api";
const getToken = () => {
  return localStorage.getItem("auth_token");
};

export const registerUser = async (
  username: string,
  password: string,
  encryptionKey: string,
  router: any
) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      username,
      password,
      encryptionKey
    });

    if (response.status === 201) {
      router.push("/");
    }
  } catch (error) {
    if (error.response) {
      console.error("Ошибка регистрации:", error.response.data.message);
    } else {
      console.error("Ошибка:", error.message);
    }
  }
};

export const loginUser = async (
  username: string,
  password: string,
  router: any
) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username,
      password
    });

    if (response.status === 200) {
      const { token } = response.data;
      localStorage.setItem("auth_token", token);
      router.push("/chat");
    }
  } catch (error) {
    if (error.response) {
      console.error("Ошибка входа:", error.response.data.message);
    } else {
      console.error("Ошибка:", error.message);
    }
  }
};

export const getMessages = async () => {
  const token = getToken();

  if (!token) {
    throw new Error("Токен отсутствует. Пожалуйста, войдите в систему.");
  }

  try {
    const response = await axios.get(`${API_URL}/chat/messages`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка получения сообщений:", error);
    throw new Error("Ошибка получения сообщений");
  }
};

// Метод для отправки сообщения
export const sendMessage = async (content: string): Promise<IMessage> => {
  const token = getToken();

  // Логика отправки сообщения
  const response = await fetch(`${API_URL}/chat/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ content })
  });

  if (!response.ok) throw new Error("Ошибка отправки сообщения");

  return await response.json(); // Предполагаем, что сервер возвращает IMessage
};

// Метод для очистки сообщений
export const clearMessages = async () => {
  const token = getToken();

  if (!token) {
    throw new Error("Токен отсутствует. Пожалуйста, войдите в систему.");
  }

  try {
    const response = await axios.delete(`${API_URL}/chat/clear`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка очистки сообщений:", error);
    throw new Error(
      error.response?.data?.message || "Ошибка очистки сообщений"
    );
  }
};
