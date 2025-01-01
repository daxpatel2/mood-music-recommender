import React, { useEffect, useState } from "react";

function FriendsFeed({ currentUserId }) {
  const [friendsData, setFriendsData] = useState([]);

  useEffect(() => {
    async function fetchFeed() {
      const res = await axios.get("/api/friends-feed");
      if (res.ok) {
        const data = await res.json();
        setFriendsData(data);
      }
    }
    fetchFeed();
  }, [currentUserId]);

  return (
    <div>
      <h2>Friends Feed</h2>
      {friendsData.map((item) => (
        <div key={item.friendId}>
          <strong>{item.friendId}</strong> is listening to{" "}
          {item.trackName ? item.trackName : "nothing"} by{" "}
          {item.artists?.join(", ")}
        </div>
      ))}
    </div>
  );
}

export default FriendsFeed;
