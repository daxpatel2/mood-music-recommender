import React, { useContext, useState } from "react";
import { UserContext } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/results?query=${encodeURIComponent(query)}`);
    }
  };

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
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            onClick={handleSearch}
            type="submit"
            className="search-button"
          >
            Search
          </button>
        </form>
      </div>

      <footer className="home-footer">
        <p>Made with love from Dax Patel</p>
      </footer>
    </div>
  );
};

export default Home;
