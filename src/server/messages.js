import fs from "fs";
import path from "path";

// Путь к файлу с сообщениями
const messagesFilePath = path.resolve("messages.json");

// Функция для загрузки сообщений из файла
export const loadMessages = () => {
  try {
    if (fs.existsSync(messagesFilePath)) {
      const data = fs.readFileSync(messagesFilePath, "utf-8");
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error("Error loading messages:", error);
    return [];
  }
};

// Функция для сохранения сообщений в файл
export const saveMessages = (messages) => {
  try {
    fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2));
  } catch (error) {
    console.error("Error saving messages:", error);
  }
};

// Загрузка сообщений при старте сервера
let messages = loadMessages();
