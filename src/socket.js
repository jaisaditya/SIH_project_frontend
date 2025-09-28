// frontend/src/socket.js
import { io } from "socket.io-client";

// const SOCKET_URL = "https://sih-project-backend-7l8d.onrender.com";
// new 
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  reconnection: true,
});

export default socket;
