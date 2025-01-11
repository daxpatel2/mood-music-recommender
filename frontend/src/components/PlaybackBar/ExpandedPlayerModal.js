import React from "react";
import { FaStop, FaPlay, FaPause } from "react-icons/fa";
// Maybe you want to show participants, messages, or whatever.

function ExpandedPlayerModal({
  onClose,
  currentTrack,
  isPlaying,
  onPause,
  onResume,
}) {
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
        {currentTrack?.album && (
          <img
            src={currentTrack.album.images[0]?.url}
            alt="Album Cover"
            style={{
              width: 200,
              height: 200,
              objectFit: "cover",
              borderRadius: 12,
            }}
          />
        )}

        <h2 style={{ margin: "20px 0 10px" }}>
          {currentTrack?.name || "No track playing"}
        </h2>
        <p style={{ marginBottom: 20 }}>
          {currentTrack.artists.map((artist) => artist.name).join(", ")}
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

        <div style={{ marginTop: 30 }}>
          <h2>Others listening with you</h2>
          {/* ... embed your chat or participant list here ... */}
        </div>
      </div>
    </div>
  );
}

export default ExpandedPlayerModal;
