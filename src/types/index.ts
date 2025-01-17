export interface IMessage {
  id?: string;
  message: string;
  username: string;
  timestamp: string;
}

export interface AuthCredentials {
  username: string;
  password: string;
}

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

export interface IAuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: { id: string; name: string } | null;
}

export type SocketStatus = {
  isConnected: boolean;
};

export type AuthMode = "login" | "register";

export type State = {
  username: string;
  password: string;
  isLoading: boolean;
  error: string | null;
};

export type InputField = {
  model: keyof Pick<State, "username" | "password">;
  type: string;
  placeholder: string;
  autocomplete: string;
  minlength?: number;
};
