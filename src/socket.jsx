import { io } from "socket.io-client";

export const socket = io("https://nbbackend-vqt8.onrender.com/", {
  transports: ["websocket"], // Force WebSocket only
  withCredentials: true,
});
