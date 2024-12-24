// src/utils/spotify.js

import axios from "axios";

// Define a mapping from moods to Spotify genres
const moodToGenre = {
  happy: "pop",
  sad: "sad",
  energetic: "dance",
  calm: "ambient",
  romantic: "romance",
  // Add more mappings as needed
};

const getSpotifyRecommendations = async (mood, accessToken) => {
  try {
    const genre = moodToGenre[mood.toLowerCase()] || "pop"; // Default to 'pop' if mood not mapped
    const response = await axios.get(
      "https://api.spotify.com/v1/recommendations",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          seed_genres: genre,
          limit: 10,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return null;
  }
};

export { getSpotifyRecommendations };
