export const ANONYMOUS = "Anonymous";

export const AUTH_TOKEN_KEY = "auth_token";

export const MESSAGE_PER_PAGE = 15;

export const INPUT_WIDTH = 300;

export const MESSAGES_STORAGE_KEY = "chat_messages";

export const API_URL = "http://localhost:3000";

export const DEFAULT_ERROR_MESSAGES = {
  register: "Registration error",
  login: "Login error"
};

export const AUTH_ERROR_MESSAGES: Record<
  "register" | "login",
  Record<string, string>
> = {
  register: {
    "400": "Invalid data for registration",
    "409": "User with this username already exists",
    "500": "Server error during registration"
  },
  login: {
    "400": "Invalid username or password",
    "401": "Invalid credentials",
    "500": "Server error during login"
  }
};

export const CHAT_ERROR_MESSAGES = {
  TOKEN_NOT_FOUND: "Authentication token not found. Please log in again.",
  SESSION_EXPIRED: "Session expired. Please log in again.",
  NO_MESSAGES: "No messages found.",
  LOAD_MESSAGES_FAILED: "Failed to load messages.",
  CLEAR_MESSAGES_FAILED: "Failed to clear messages.",
  UNEXPECTED_ERROR: "An unexpected error occurred.",
  CHAT_INIT_FAILED:
    "Failed to initialize chat. Please try refreshing the page.",
  SEND_MESSAGE_FAILED: "Failed to send message. Please try again.",
  NOT_CONNECTED: "Not connected to chat. Please check your connection.",
  EMPTY_MESSAGE: "Message cannot be empty.",
  DISCONNECT_FAILED: "Error disconnecting from chat.",
  CONNECT_FAILED: "Failed to connect to chat. Please try refreshing the page."
};
