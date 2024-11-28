export interface IMessage {
  id: number;
  content: string;
  senderId: number;
  sender: {
    username: string;
  };
  timestamp: string;
}

export interface IWebSocketState {
  isConnected: boolean;
  messages: IMessage[];
}

export interface IWebSocketEvents {
  onMessage?: (message: IMessage) => void;
  onConnectionChange?: (status: boolean) => void;
}
