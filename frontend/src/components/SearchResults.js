import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import "./SearchResults.css";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query");
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await axios.get(
          `api/recommendations?query=${encodeURIComponent(query)}`,
          {
            withCredentials: true,
          }
        );
        setResults(response.data.tracks);
      } catch (err) {
        setError("Failed to fetch recommendations.");
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [query]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="results-container">
      <h1>Results for "{query}"</h1>
      {results.length > 0 ? (
        <ul className="results-list">
          {results.map((track) => (
            <li key={track.id} className="result-item">
              <img src={track.album.images[0].url} alt={track.name} />
              <div>
                <strong>{track.name}</strong>
                <p>
                  By {track.artists.map((artist) => artist.name).join(", ")}
                </p>
              </div>
              <audio controls src={track.preview_url}>
                Your browser does not support the audio element.
              </audio>
            </li>
          ))}
        </ul>
      ) : (
        <p>No results found.</p>
      )}
    </div>
  );
};

export default SearchResults;
