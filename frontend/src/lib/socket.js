import { io } from "socket.io-client";

let socket;

export const connectSocket = (token) => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL, {
      autoConnect: false,
      auth: { token },
    });
  }

  if (!socket.connected) {
    socket.auth = { token };
    socket.connect();
  }

  return socket;
};

export const getSocket = () => socket;
