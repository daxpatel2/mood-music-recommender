import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SpotifyPlayer from "./SpotifyPlayer";
import PlaybackControls from "./ControlPlayback";
import { UserContext } from "../contexts/UserContext";
import { DeviceContext } from "../contexts/DeviceContext";

const AuthSuccess = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  // 1) Show a welcome message for 3 seconds, then redirect
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);
    // Cleanup the timer if this component unmounts before 3s
    return () => clearTimeout(timer);
  }, [navigate]);

  //it renders the loading state and not the others meaning that user in authjs never changes to user
  if (!user) {
    return <div>Loading...</div>;
  } else {
    return (
      <div>
        <SpotifyPlayer token={user.accessToken} />;
        <h2>Welcome, {user.profile.displayName}!</h2>
        <p>You will be redirected in 5 seconds....</p>
      </div>
    );
  }
};

export default AuthSuccess;
