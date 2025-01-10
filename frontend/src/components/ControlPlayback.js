import axios from "axios";
import React, { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export const startPlayback = async (
  accessToken,
  deviceId,
  trackUri,
  positionMs = 0
) => {
  try {
    await axios.put(
      `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
      {
        uris: [trackUri],
        position_ms: positionMs,
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
  const [roomId, setRoomId] = useState(null);
  const socketRef = useRef(null);

  /**
   * 1) On mount, create the socket and create a room in the backend.
   *    Then join that room.
   */
  useEffect(() => {
    const socket = io("http://localhost:5000");
    socketRef.current = socket;

    const createRoomAndJoin = async () => {
      try {
        const response = await axios.post("/create-room", {
          userId: user.id,
        });
        setRoomId(response.data.roomId);

        // Once we have the new roomId, join it
        socket.emit("joinRoom", response.data.roomId);
      } catch (err) {
        console.error("Error creating room:", err);
      }
    };

    createRoomAndJoin();
    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [user.id]);

  useEffect(() => {
    // If we don't have a socket or a roomId yet, do nothing
    if (!socketRef.current || !roomId) return;

    const socket = socketRef.current;

    // Poll the Spotify player for the current playback position every second
    const intervalId = setInterval(async () => {
      try {
        const { data } = await axios.get(
          "https://api.spotify.com/v1/me/player",
          {
            headers: { Authorization: `Bearer ${user.accessToken}` },
          }
        );
        if (data && data.is_playing) {
          // The track URI might be data.item.uri

          const positionMs = data.progress_ms;
          const isPlaying = data.is_playing;
          socketRef.current.emit("updatePosition", {
            roomId,
            trackUri: track.uri,
            positionMs,
            isPlaying,
            lastUpdated: Date.now(),
          });
        }
      } catch (err) {
        console.error("Error polling Spotify player:", err);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [user.accessToken, roomId]);

  const handlePlay = async () => {
    const positionMs = 0;
    startPlayback(user.accessToken, deviceId, track.uri, positionMs);
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

    // Emit to the server that we started playing
    socketRef.current.emit("updatePosition", {
      roomId,
      trackId: track.uri,
      positionMs,
      isPlaying: true,
      lastUpdated: Date.now(),
    });
  };

  const handlePause = () => {
    pausePlayback(user.accessToken);
    // Let the server know we're now paused
    socketRef.current.emit("updatePosition", {
      roomId,
      trackId: track.uri,
      // If you want to fetch real progress before pausing, you can do so
      positionMs: 0,
      isPlaying: false,
      lastUpdated: Date.now(),
    });
  };

  const handleResume = () => {
    resumePlayback(user.accessToken);
    // Let the server know we're playing
    socketRef.current.emit("updatePosition", {
      roomId,
      trackId: track.uri,
      // You might want to fetch the real positionMs from Spotify first
      positionMs: 0,
      isPlaying: true,
      lastUpdated: Date.now(),
    });
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
