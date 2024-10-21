export interface IMessage {
  id: number;
  senderId: number;
  content: string;
  sender: {
    username: string;
  };
  timestamp: string;
}
