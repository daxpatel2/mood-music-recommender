import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SpotifyPlayer from "./SpotifyPlayer";
import { UserContext } from "../contexts/UserContext";

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
  }

  // If user exists, check the provider
  if (user.provider === "spotify") {
    return (
      <div>
        <h2>Welcome, {user.profile.displayName}!</h2>
        {/* Maybe show the Spotify player, because we have a Spotify token */}
        <SpotifyPlayer token={user.accessToken} />;
        <p>You will be redirected in 5 seconds...</p>
      </div>
    );
  } else if (user.provider === "google") {
    return (
      <div>
        <h2>Welcome, {user.profile.displayName}!</h2>
        <p>You’re logged in with Google.</p>
        <p>You will be redirected in 5 seconds...</p>
      </div>
    );
  } else {
    // Fallback if no provider is set
    return (
      <div>
        <h2>Welcome, {user.profile.displayName}!</h2>
        <p>(Unrecognized provider.)</p>
      </div>
    );
  }
};

export default AuthSuccess;
