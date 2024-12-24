import React from "react";

const Recommendations = ({ data }) => {
  if (!data || !data.tracks) {
    return <div>No recommendations found.</div>;
  }

  return (
    <div>
      <h2>Recommended Tracks:</h2>
      <ul>
        {data.tracks.map((track) => (
          <li key={track.id} style={{ marginBottom: "20px" }}>
            <img
              src={track.album.images[0].url}
              alt={track.name}
              style={{ width: "100px" }}
            />
            <div>
              <strong>{track.name}</strong> by{" "}
              {track.artists.map((artist) => artist.name).join(", ")}
            </div>
            <audio controls src={track.preview_url}>
              Your browser does not support the audio element.
            </audio>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Recommendations;
