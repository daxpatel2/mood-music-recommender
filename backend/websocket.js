const { Server } = require("socket.io");
const { fetchRoomData } = require("./mongo");

function createWebSocketServer(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000", // Frontend URL
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A client connected with socket ID:", socket.id);

    socket.on("joinRoom", async (roomId) => {
      console.log(`User ${socket.id} joined room: ${roomId}`);
      socket.join(roomId);

      // Fetch room data
      const roomData = await fetchRoomData(roomId);

      // Emit room data
      socket.emit("roomData", roomData);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
}

module.exports = createWebSocketServer;
