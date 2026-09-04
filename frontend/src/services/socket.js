import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ||
  process.env.REACT_APP_BACKEND_URL ||
  "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  withCredentials: true,
  transports: ["websocket", "polling"],
});

/**
 * Join a parking room (e.g., parking-123) for real-time slot telemetry.
 * Automatically waits for connection if socket is currently connecting.
 */
export const joinParkingRoom = (parkingId) => {
  if (!parkingId) return;

  if (socket.connected) {
    socket.emit("joinParking", parkingId);
  } else {
    socket.once("connect", () => {
      socket.emit("joinParking", parkingId);
    });
  }
};

/**
 * Leave a parking room when navigating away.
 */
export const leaveParkingRoom = (parkingId) => {
  if (!parkingId) return;
  socket.emit("leaveParking", parkingId);
};

export default socket;
