import React, { useInsertionEffect, useState, useEffect } from "react";
import { FaPlay, FaPause } from "react-icons/fa"; // or some other icons
import ExpandedPlayerModal from "./ExpandedPlayerModal";

function FooterPlayer({ currentTrack, isPlaying, onPause, onResume }) {
  const [showModal, setShowModal] = useState(false);

  // Toggle the modal open/closed
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      {/* Mini player bar at the bottom */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#333",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 20px",
          cursor: "pointer",
          zIndex: 1000,
        }}
        onClick={handleOpenModal}
      >
        {/* Left side: track info */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* Maybe show album art if you have it */}
          {currentTrack.albumCover ? (
            <img
              src={currentTrack.albumCover}
              alt="Album Cover"
              style={{
                width: 40,
                height: 40,
                borderRadius: 4,
                marginRight: 10,
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
          <div>
            <div style={{ fontWeight: "bold", marginBottom: 4 }}>
              {currentTrack.name || currentTrack.trackName || "No track"}
            </div>
            <div style={{ fontSize: 12 }}>
              {currentTrack.artistName ||
                currentTrack.artists.map((artist) => artist.name).join(", ") ||
                "Unknown artist"}
            </div>
          </div>
        </div>

        {/* Right side: playback controls */}
        <div style={{ display: "flex", gap: 10 }}>
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
      </div>

      {/* Modal */}
      {showModal && (
        <ExpandedPlayerModal
          onClose={handleCloseModal}
          currentTrack={currentTrack}
          onPause={() => onPause()}
          onResume={() => onResume()}
        />
      )}
    </>
  );
}

export default FooterPlayer;
