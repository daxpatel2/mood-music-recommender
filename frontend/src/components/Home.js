import React, { useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import "./Home.css"; // We will define our styles in Home.css

const Home = () => {
  const { user } = useContext(UserContext);

  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <div className="header-right">
          {user ? (
            <div className="profile-info">
              <img
                src={
                  user.profile.photos && user.profile.photos.length > 0
                    ? user.profile.photos[0].value
                    : "https://via.placeholder.com/40"
                }
                alt="User Avatar"
                className="profile-avatar"
              />
              <span className="profile-name">
                {user.profile.displayName || "User"}
              </span>
            </div>
          ) : (
            <button className="sign-in-button">Sign In</button>
          )}
        </div>
      </header>

      {/* Main Content: Title and Search Bar */}
      <div className="search-section">
        <h1 className="search-title">Mood Music Recommender</h1>
        <form className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Search your mood..."
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>
      </div>

      <footer className="home-footer">
        <p>
          <a href="https://...">Link 1</a> | <a href="https://...">Link 2</a>
        </p>
      </footer>
    </div>
  );
};

export default Home;
