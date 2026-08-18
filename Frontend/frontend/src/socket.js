import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.CLIENT_URL || "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
});

export function connectSocket(token) {
  socket.auth = { token };

  if (!socket.connected) {
    socket.connect();
  }
}

export function disconnectSocket() {
  socket.disconnect();
}