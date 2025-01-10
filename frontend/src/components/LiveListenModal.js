import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function LiveListenModal({ isOpen, onClose, friend, friendListening }) {
  const navigate = useNavigate();
  if (!isOpen) return null;

  const handleJoinRoom = async (friendId) => {
    try {
      const response = await axios.post("/live-listen", { friendId });
      if (response.data) {
        // Redirect to the room
        navigate(`/room/${response.data}`, {
          state: { friendListening: friendListening },
        });
        //window.location.href = `/room/${response.data}`;
      } else {
        alert(response.data.message || "Failed to join live listen room");
      }
    } catch (error) {
      console.error("Error joining live listen room:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          maxWidth: "400px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <h3>Live Listen with: {friend}</h3>
        <img
          src={
            friendListening?.track?.albumCover ||
            "https://via.placeholder.com/150"
          }
          alt={`${
            friendListening?.track?.trackName || "Unknown track"
          } album cover`}
          style={{
            width: "100%",
            height: "100px",
            objectFit: "cover",
            borderRadius: "8px",
          }}
        />
        <p>{friendListening?.track?.trackName || "Unknown track"}</p>
        <p>{friendListening?.track?.artistName || "Unknown artist"}</p>

        <button
          onClick={() => handleJoinRoom(friend)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#1DB954",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Join Live Listening Room
        </button>

        <button
          onClick={onClose}
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            backgroundColor: "red",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default LiveListenModal;
