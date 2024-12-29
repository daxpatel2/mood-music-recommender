import React, { useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import "./SearchResults.css";
import { DeviceContext } from "../contexts/DeviceContext";
import Recommendations from "./Recommendations";

const SearchResults = () => {
  const { deviceId } = useContext(DeviceContext);
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
        setResults(response.data);
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

  return <Recommendations data={results} />;
};

export default SearchResults;
