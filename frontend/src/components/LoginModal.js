import React from "react";
import "./LoginModal.css"; // We'll define this next
import { useContext } from "react";
import { UserContext } from "../contexts/UserContext";

const LoginModal = ({ isOpen, onClose }) => {
  const { setUser } = useContext(UserContext);
  if (!isOpen) return null; // if not open, don't render anything

  const handleSpotifyLogin = () => {
    // go to the backend route for Spotify login
    window.location.href = "http://localhost:5000/login";
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  const handleSubmit = (e) => {
    console.log("Form submitted");
  };

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      {/* Stop clicks inside the modal from closing it */}
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        {/* Headings */}
        <h2 className="login-modal-title">Welcome</h2>
        <p className="login-modal-subtitle">Select your signin method.</p>

        {/* Provider Buttons */}
        <div className="login-modal-providers">
          <button
            className="login-modal-provider-button spotify-button"
            onClick={handleSpotifyLogin}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg"
              alt="Spotify Logo"
              className="provider-icon"
            />
            Spotify
          </button>

          <button
            className="login-modal-provider-button google-button"
            onClick={handleGoogleLogin}
          >
            <img
              src="https://loodibee.com/wp-content/uploads/Google-Symbol.png"
              className="provider-icon"
            />
            Google
          </button>
        </div>
        {/* Divider */}
        <div className="login-modal-divider">
          <span>OR</span>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="login-modal-form">
          <div className="login-input-group">
            <label htmlFor="email">E-Mail Address</label>
            <input
              type="email"
              id="email"
              placeholder="Enter email..."
              required
            />
          </div>

          <div className="login-input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter password..."
              required
            />
          </div>

          <button className="login-submit-button" type="submit">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
