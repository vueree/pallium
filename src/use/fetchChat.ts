import { ref } from "vue";
import axios from "axios";

const messagesRef = ref([]);

export const registerUser = async (
  username: string,
  password: string,
  encryptionKey: string,
  router: any
) => {
  try {
    const response = await axios.post(
      "http://localhost:5000/api/auth/register",
      {
        username,
        password,
        encryptionKey
      }
    );

    if (response.status === 201) {
      router.push("/");
    }
  } catch (error) {
    if (error.response) {
      console.error(error.response.data.message);
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
    const response = await axios.post("http://localhost:5000/api/auth/login", {
      username,
      password
    });
    if (response.status === 200) {
      router.push("/chat");
      console.log("Заходи");
    }

    localStorage.setItem("token", response.data.token);
  } catch (error) {
    if (error.response) {
      console.error(error.response.data.message);
    } else {
      console.error("Ошибка:", error.message);
    }
  }
};

export const fetchGetMessages = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/chat/messages");
    messagesRef.value = response.data;
  } catch (error) {
    console.error("Ошибка при получении сообщений:", error);
  }
};
