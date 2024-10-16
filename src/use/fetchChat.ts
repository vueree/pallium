import { ref } from "vue";
import axios from "axios";

const messagesRef = ref([]);

export const fetchGetMessages = async () => {
  try {
    const response = await axios.get("http://localhost:3000/messages");
    messagesRef.value = response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
  }
};
