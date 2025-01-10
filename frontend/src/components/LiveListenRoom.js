import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import { useLocation } from "react-router-dom";

function LiveListenRoom() {
  const location = useLocation();
  const { roomId } = useParams();
  const [participants, setParticipants] = useState([]);
  const [socket, setSocket] = useState(null);
  const [currentTrack, setCurrentTrack] = useState({
    albumCover: "https://via.placeholder.com/300",
    trackName: "Unknown Track",
    artistName: "Unknown Artist",
    albumName: "Unknown Album",
  });

  useEffect(() => {
    // Connect to the WebSocket server
    const newSocket = io("http://localhost:5000", { query: { roomId } });
    setSocket(newSocket);

    newSocket.emit("joinRoom", roomId);
    newSocket.emit("getParticipants", roomId);

    setCurrentTrack(location.state?.friendListening?.track || currentTrack);

    // Listen for participant updates
    newSocket.on("update-participants", (data) => {
      console.log("Received track update:", data.participants);
      setParticipants(data.participants);
    });

    newSocket.on("roomData", (roomData) => {
      console.log("Received room data:", roomData);
      if (roomData.currentTrack) {
        setCurrentTrack(roomData.currentTrack);
      }
    });

    // Listen for current track updates
    newSocket.on("trackUpdated", (track) => {
      console.log("Received track update:", track);
      setCurrentTrack(track);
    });

    // Cleanup on component unmount
    return () => newSocket.close();
  }, [roomId]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#f7f7f7",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <h1 style={{ color: "#1DB954", marginBottom: "20px" }}>
        Live Listen Room
      </h1>
      <h2 style={{ color: "#666", marginBottom: "40px" }}>Room ID: {roomId}</h2>

      {/* Current Track Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "#fff",
          borderRadius: "16px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          padding: "20px",
          marginBottom: "30px",
          width: "100%",
          maxWidth: "600px",
        }}
      >
        <img
          src={currentTrack.albumCover}
          alt="Album Cover"
          style={{
            width: "300px",
            height: "300px",
            objectFit: "cover",
            borderRadius: "16px",
            marginBottom: "20px",
          }}
        />
        <h3 style={{ color: "#333", marginBottom: "10px" }}>
          {currentTrack.trackName}
        </h3>
        <p style={{ color: "#666", marginBottom: "5px" }}>
          Artist: {currentTrack.artistName}
        </p>
        <p style={{ color: "#666" }}>Album: {currentTrack.albumName}</p>
      </div>

      {/* Participants Section */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          padding: "20px",
          width: "100%",
          maxWidth: "600px",
          marginBottom: "30px",
        }}
      >
        <h3 style={{ marginBottom: "10px" }}>Participants</h3>
        <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
          {participants.map((participant) => (
            <li
              key={participant}
              style={{
                padding: "10px",
                borderBottom: "1px solid #ddd",
                color: "#444",
              }}
            >
              {participant}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default LiveListenRoom;
