import React, { useState } from "react";
import PlaybackControls, {
  startPlayback,
  pausePlayback,
  resumePlayback,
} from "./ControlPlayback";
import { UserContext } from "../contexts/UserContext";
import { DeviceContext } from "../contexts/DeviceContext";
import { useContext } from "react";
import "./Recommendations.css";
import FooterPlayer from "./PlaybackBar/FooterPlayer";

const Recommendations = ({ data }) => {
  const { user } = useContext(UserContext);
  const { deviceId } = useContext(DeviceContext);
  const [showFooterPlayer, setFooterPlayer] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(false);

  if (!data || !data.tracks) {
    return <div>No recommendations found.</div>;
  }

  const handlePlayTrack = (track) => {
    console.log(("handlePlayTrack called with trackUri:", track.uri));
    if (!user || !deviceId) return;
    setFooterPlayer(true);
    setCurrentTrack(track);
    setCurrentStatus(true);
    //startPlayback(user.accessToken, deviceId, trackUri);
  };

  function formatDuration(ms) {
    // Convert milliseconds to "m:ss"
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  return (
    <div className="recommendations-wrapper">
      <h2 className="recommendations-title">Recommended Tracks</h2>
      <div className="recommendations-table">
        {/* Header row */}
        <div className="table-header">
          <div className="col-number">#</div>
          <div className="col-title">Title</div>
          <div className="col-artist">Artist</div>
          <div className="col-album">Album</div>
          <div className="col-duration">Duration</div>
        </div>

        {/* Body rows */}
        {data.tracks.map((track, index) => (
          <div key={track.id} className="table-row">
            <div className="col-number">{index + 1}</div>
            {/* Mini image of the song */}
            <img
              src={track.album.images[0]?.url}
              alt={track.name}
              style={{
                width: "40px",
                height: "40px",
                objectFit: "cover",
                borderRadius: "4px",
                marginRight: "10px",
              }}
            />
            <div className="col-title">
              <div className="track-info">
                <span className="track-name">{track.name}</span>
              </div>
            </div>
            <div className="col-artist">
              {track.artists.map((artist) => artist.name).join(", ")}
            </div>
            <div className="col-album">{track.album.name}</div>
            <div className="col-duration">
              {formatDuration(track.duration_ms)}
              <button
                onClick={() => handlePlayTrack(track)}
                className="play-button"
              >
                Play
              </button>
            </div>
          </div>
        ))}
      </div>

      {showFooterPlayer && (
        <FooterPlayer
          currentTrack={currentTrack}
          isPlaying={currentStatus}
          onPlay={() =>
            startPlayback(user.accessToken, deviceId, currentTrack.uri)
          }
          onPause={() => pausePlayback(user.accessToken)}
          onResume={() => resumePlayback(user.accessToken)}
        />
      )}
    </div>
  );
};

export default Recommendations;
