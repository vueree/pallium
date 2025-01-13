import { Socket } from "socket.io-client";

export interface IMessage {
  id?: string;
  message: string;
  username: string;
  timestamp: string;
}

export interface IServerToClientEvents {
  connect: () => void;
  disconnect: (reason: string) => void;
  new_message: (message: IMessage) => void;
  error: (error: { message: string }) => void;
}

export interface IPaginatedMessages {
  currentPage: number;
  totalPages: number;
  totalMessages: number;
  messages: IMessage[];
}

export interface IChatState {
  input: string;
  username: string;
}

export interface IWebSocketState {
  isConnected: boolean;
  message: IMessage[];
}

export interface IWebSocketEvents {
  onMessage?: (message: IMessage) => void;
  onConnectionChange?: (status: boolean) => void;
}

export interface WebSocketState {
  socket: Socket | null;
  isConnected: boolean;
}

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface ILoginResponse {
  token: string | undefined;
  user?: {
    id: number;
    username: string;
  };
}

export type AuthMode = "login" | "register";

export interface IAuthResponse {
  token: string | undefined;
  message: string;
  user?: {
    id: number;
    username: string;
  };
}

export interface AuthState {
  username: string;
  password: string;
  isLoading: boolean;
  error: string | null;
}

export type State = {
  username: string;
  password: string;
  isLoading: boolean;
  error: string | null;
};

export interface ISocketState {
  socket: Socket | null;
  messages: IMessage[];
  isConnected: boolean;
  username: string | null;
}

export type InputField = {
  model: keyof Pick<State, "username" | "password">;
  type: string;
  placeholder: string;
  autocomplete: string;
  minlength?: number;
};

export interface IAuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: { id: string; name: string } | null;
}
