export interface IMessage {
  id: number;
  content: string;
  senderId: number;
  sender: {
    username: string;
  };
  timestamp: string;
}
