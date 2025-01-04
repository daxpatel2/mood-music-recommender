import axios from "axios";

export const startPlayback = async (accessToken, deviceId, trackUri) => {
  try {
    await axios.put(
      `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
      {
        uris: [trackUri],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error(
      "Error starting playback:",
      err.response?.data || err.message
    );
  }
};

const pausePlayback = async (accessToken) => {
  try {
    await axios.put(
      "https://api.spotify.com/v1/me/player/pause",
      {},
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
  } catch (err) {
    console.error("Error pausing playback:", err.response?.data || err.message);
  }
};

const resumePlayback = async (accessToken) => {
  try {
    await axios.put(
      "https://api.spotify.com/v1/me/player/play",
      {},
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
  } catch (err) {
    console.error(
      "Error resuming playback:",
      err.response?.data || err.message
    );
  }
};

const PlaybackControls = ({ deviceId, user, track }) => {
  // Example track URI for demonstration
  // const trackUri = "spotify:track:4uLU6hMCjMI75M1A2tKUQC"; // Example track

  const handlePlay = async () => {
    startPlayback(user.accessToken, deviceId, track.uri);
    try {
      const response = await axios.post("/update-currentTrack", {
        track,
        deviceId,
        user,
      });
      console.log("Playback info updated in the database:", response.data);
    } catch (err) {
      console.error("Error updating playback info into the database:" + err);
    }
  };

  const handlePause = () => {
    pausePlayback(user.accessToken);
  };

  const handleResume = () => {
    resumePlayback(user.accessToken);
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <button onClick={handlePause}>Pause</button>
      <button onClick={handlePlay}>Play Track</button>
      <button onClick={handleResume}>Resume</button>
    </div>
  );
};

export default PlaybackControls;
