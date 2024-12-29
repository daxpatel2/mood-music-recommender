import React, { useState, useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import { getSpotifyRecommendations } from "../utils/spotify";
import Recommendations from "./Recommendations";
import AuthSuccess from "./Authsuccess";

const SearchBar = () => {
  const { deviceId } = useContext(DeviceContext);
  const [query, setQuery] = useState("");
  const [recommendations, setRecommendations] = useState(null);
  const { user } = useContext(UserContext);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!user || !user.accessToken) {
      alert("Please log in to get recommendations.");
      return;
    }
    const data = await getSpotifyRecommendations(query, user.accessToken);
    if (data) {
      setRecommendations(data);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your mood (e.g., happy, sad)"
          required
        />
        <button type="submit">Search</button>
      </form>
      {recommendations && (
        <Recommendations data={recommendations} deviceId={deviceId} />
      )}
    </div>
  );
};

export default SearchBar;
