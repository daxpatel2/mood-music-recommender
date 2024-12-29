import React from "react";
import PlaybackControls, { startPlayback } from "./ControlPlayback";
import { UserContext } from "../contexts/UserContext";
import { DeviceContext } from "../contexts/DeviceContext";
import { useContext } from "react";
import SpotifyPlayer from "./SpotifyPlayer";

const Recommendations = ({ data }) => {
  const { user } = useContext(UserContext);
  const { deviceId } = useContext(DeviceContext);

  // const handleDeviceReady = (id) => {
  //   setDeviceId(id);
  // };

  if (!data || !data.tracks) {
    return <div>No recommendations found.</div>;
  }

  const handlePlayTrack = (trackUri) => {
    console.log(console.log("handlePlayTrack called with trackUri:", trackUri));
    if (!user || !deviceId) return;
    startPlayback(user.accessToken, deviceId, trackUri);
  };

  return (
    <>
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
                <PlaybackControls
                  deviceId={deviceId}
                  accessToken={user.accessToken}
                  trackUri={track.uri}
                />
                <strong>{track.name}</strong> by{" "}
                {track.artists.map((artist) => artist.name).join(", ")}
              </div>
              <button onClick={handlePlayTrack(track.uri)}>
                Play Full Track
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Recommendations;

// {
//   /* Show playback controls if we have a device ready */
// }
// {
//   /* {deviceId && (
//           <PlaybackControls deviceId={deviceId} accessToken={accessToken} />
//         )} */
// }
// <SpotifyPlayer token={accessToken} onDeviceReady={handleDeviceReady} />;
