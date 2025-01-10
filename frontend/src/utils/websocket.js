import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const useWebSocket = (url) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(url, {
      transports: ["websocket"], // Use WebSocket for real-time communication
    });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect(); // Clean up the connection on component unmount
    };
  }, [url]);

  return socket;
};

export default useWebSocket;
