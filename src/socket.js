// frontend/src/socket.js
import { io } from "socket.io-client";

// ⚠️ Replace with your backend URL (http://localhost:5000 in dev)
const SOCKET_URL = "http://localhost:5000";

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  reconnection: true,
});

export default socket;
