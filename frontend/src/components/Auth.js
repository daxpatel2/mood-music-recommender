import React from "react";
import { UserContext } from "../contexts/UserContext";

// component that handles the login and logout by taking user to the backend routes
const Auth = () => {
  const { user } = React.useContext(UserContext);
  const handleLogin = () => {
    window.location.href = "http://localhost:5000/login";
  };

  const handleLogout = () => {
    window.location.href = "http://localhost:5000/logout";
  };

  return (
    <div>
      {!user ? (
        <button onClick={handleLogin}>Log in with Spotify</button>
      ) : (
        <button onClick={handleLogout}>Log Out</button>
      )}
    </div>
  );
};

export default Auth;
