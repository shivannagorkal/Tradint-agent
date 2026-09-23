import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io("http://localhost:4000", {
      withCredentials: true,
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("[Confluence Socket] Connected:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Confluence Socket] Disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.warn("[Confluence Socket] Connection error:", err.message);
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
