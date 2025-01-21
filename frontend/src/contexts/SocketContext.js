// src/contexts/DeviceContext.js
import React, { createContext, useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [roomId, setRoomId] = useState(null);
  const socketRef = useRef(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const socket = io("http://localhost:5000", {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      setIsSocketConnected(true); // Mark as connected
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsSocketConnected(false); // Mark as disconnected
    });

    return () => {
      socket.disconnect(); // Clean up on unmount
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket: isSocketConnected ? socketRef.current : null,
        roomId,
        setRoomId,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
