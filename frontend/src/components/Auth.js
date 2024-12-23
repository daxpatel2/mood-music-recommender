import React from "react";

const Auth = () => {
  const handleLogin = () => {
    window.location.href = "http://localhost:5000/login";
  };

  const handleLogout = () => {
    window.location.href = "http://localhost:5000/logout";
  };

  return (
    <div>
      <button onClick={handleLogin}>Log in with Spotify</button>
      <button onClick={handleLogout}>Log Out</button>
    </div>
  );
};

export default Auth;
