import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { UserContext } from "../contexts/UserContext";
import { useContext } from "react";
import { SocketContext } from "../contexts/SocketContext";

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

export const pausePlayback = async (accessToken) => {
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

export const resumePlayback = async (accessToken) => {
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

const PlaybackControls = ({ deviceId, track }) => {
  const { user } = useContext(UserContext);
  const { socket, setRoomId, roomId } = useContext(SocketContext);

  /**
   * 1) On mount, create the socket and create a room in the backend.
   *    Then join that room.
   */
  useEffect(() => {
    const createRoomAndJoin = async () => {
      try {
        const response = await axios.post("http://localhost:5000/create-room", {
          userId: user,
        });
        setRoomId(response.data.roomId);
        // Once we have the new roomId, join it
        socket.emit("joinRoom", response.data.roomId);
        console.log("Joined room:", response.data.roomId);
        socket.emit("getParticipants", response.data.roomId);

        // Listen for participant updates
        socket.on("update-participants", (data) => {
          console.log("Received participants:", data.participants);
          setParticipants(data.participants);
        });
      } catch (error) {
        console.error("Error creating or joining room:", error);
      }
    };

    createRoomAndJoin();
  }, [user.id]);

  useEffect(() => {
    // If we don't have a socket or a roomId yet, do nothing
    if (!socket || !roomId) return;

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
          socket.emit("updatePosition", {
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
    socket.emit("updatePosition", {
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
    socket.emit("updatePosition", {
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
    socket.emit("updatePosition", {
      roomId,
      trackId: track.uri,
      // You might want to fetch the real positionMs from Spotify first
      positionMs: 0,
      isPlaying: true,
      lastUpdated: Date.now(),
    });
  };

  return <></>;
};

export default PlaybackControls;
