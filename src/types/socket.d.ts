import { Socket as BaseSocket } from "socket.io-client";

declare module "socket.io-client" {
  interface Socket extends BaseSocket {
    _pid?: string;
    _lastOffset?: number;
    _queue?: any[];
  }
}
