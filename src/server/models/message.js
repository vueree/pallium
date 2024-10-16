// src/models/message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  user: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Экспортируйте модель
const Message = mongoose.model("Message", messageSchema);
export default Message;
