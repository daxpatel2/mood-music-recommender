import React, { useEffect, useState } from "react";
import { FaPlay, FaPause } from "react-icons/fa";
import { useContext } from "react";
import { SocketContext } from "../../contexts/SocketContext";
// Maybe you want to show participants, messages, or whatever.

function ExpandedPlayerModal({ onClose, currentTrack, onPause, onResume }) {
  const [participants, setParticipants] = useState([]);
  const { socket, roomId } = useContext(SocketContext);

  useEffect(() => {
    if (!socket || !roomId) return;

    // Listen for participant updates
    socket.on("update-participants", (data) => {
      console.log("Updated participants:", data.participants);
      setParticipants(data.participants);
    });

    return () => {
      socket.off("update-participants"); // Cleanup listener on unmount
    };
  }, [socket, roomId]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.8)",
        display: "flex",
        flexDirection: "column",
        zIndex: 9999,
      }}
    >
      {/* Close Area */}

      <button
        onClick={onClose}
        style={{
          alignSelf: "flex-end",
          margin: "20px",
          background: "transparent",
          color: "#fff",
          border: "1px solid #fff",
          padding: "5px 10px",
          cursor: "pointer",
        }}
      >
        X
      </button>

      {/* Main content area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
        }}
      >
        {/* Possibly show album cover bigger */}
        {currentTrack.albumCover ? (
          <img
            src={currentTrack.albumCover}
            alt="Album Cover"
            style={{
              width: 200,
              height: 200,
              objectFit: "cover",
              borderRadius: 12,
            }}
          />
        ) : (
          <img
            src={currentTrack.album.images[0]?.url}
            alt="Album Cover"
            style={{
              width: 40,
              height: 40,
              borderRadius: 4,
              marginRight: 10,
            }}
          />
        )}
        <h2 style={{ margin: "20px 0 10px" }}>
          {currentTrack.trackName || currentTrack.name || "No track playing"}
        </h2>
        <p style={{ marginBottom: 20 }}>
          {currentTrack.artistName ||
            currentTrack.artists.map((artist) => artist.name).join(", ") ||
            "Unknown artist"}
        </p>
        {/* Playback controls in bigger form */}
        <div style={{ display: "flex", gap: 20 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onResume();
            }}
            style={{
              background: "transparent",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            <FaPlay size={20} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onPause();
            }}
            style={{
              background: "transparent",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            <FaPause size={20} />
          </button>
        </div>
        {/* Live-listening components*/}
        {participants.length > 0 ? (
          participants.map((participant) => (
            <div key={participant}>
              <p>{participant}</p>
            </div>
          ))
        ) : (
          <p>No one is currently listening.</p>
        )}
      </div>
    </div>
  );
}

export default ExpandedPlayerModal;
