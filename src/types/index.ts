export interface IMessage {
  id: number;
  text: string;
  user: string;
  timestamp: string;
}

export interface IWebSocketOptions {
  url: string;
  onMessage?: (message: IMessage) => void;
  onError?: (error: Event) => void;
  onClose?: () => void;
}
