export interface IAuthResponse {
  token: string;
  message?: string;
}

export interface IMessage {
  message: string;
  username: string;
  timestamp: string;
}

export interface IWebSocketState {
  isConnected: boolean;
  message: IMessage[];
}

export interface IWebSocketEvents {
  onMessage?: (message: IMessage) => void;
  onConnectionChange?: (status: boolean) => void;
}
