import { Socket } from "socket.io-client";
import { io } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXTJS_APP_URL!, {
      withCredentials: true,
      autoConnect: false, // We'll connect manually
      reconnection: true,
      reconnectionDelay: 1000,
    });

   
  }

  return socket;
}
