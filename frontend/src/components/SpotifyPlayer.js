// src/components/SpotifyPlayer.js
import React, { useContext, useEffect, useState } from "react";
import { DeviceContext } from "../contexts/DeviceContext";
import { UserContext } from "../contexts/UserContext";

const SpotifyPlayer = ({ token }) => {
  console.log("Spotify Player Running");
  const { user } = useContext(UserContext);
  const { setDeviceId } = useContext(DeviceContext);

  useEffect(() => {
    const initPlayer = () => {
      if (!window.Spotify) return;

      const player = new window.Spotify.Player({
        name: "My Web Playback Player",
        getOAuthToken: (cb) => cb(user.accessToken),
        volume: 0.5,
      });

      // When the player is ready, store the deviceId in context
      player.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID:", device_id);
        setDeviceId(device_id); // <-- This is how we store it in context
      });

      // Example inside the initPlayer function
      player.addListener("initialization_error", ({ message }) => {
        console.error("Initialization Error:", message);
      });
      player.addListener("authentication_error", ({ message }) => {
        console.error("aAuthentication Error:", message);
      });
      player.addListener("account_error", ({ message }) => {
        console.error("Account Error:", message);
      });
      player.addListener("playback_error", ({ message }) => {
        console.error("Playback Error:", message);
      });
      // Connect to the player
      player.connect();
    };

    if (window.Spotify) {
      initPlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = () => initPlayer();
    }
  }, [user.accessToken]);

  return null;
};

export default SpotifyPlayer;
