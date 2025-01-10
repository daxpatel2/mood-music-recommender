import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../contexts/UserContext";
import LiveListenModal from "./LiveListenModal"; // Import the modal

function FriendsFeed({ currentUserId }) {
  const [addedFriend, setAddedFriend] = useState(0);
  const { friends } = useContext(UserContext);
  const { currentlyListening } = useContext(UserContext);
  const [isModalOpenAdd, setIsModalOpenAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [selectedFriendListening, setSelectedFriendListening] = useState(null);

  const handleAddFriend = async (friendId) => {
    try {
      const response = await fetch("/add-friends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friendId: friendId, userId: currentUserId }),
      });
      setAddedFriend(addedFriend + 1);
      return response;
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `find-friends?query=${encodeURIComponent(searchQuery)}`
      );
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleOpenModal = (friend, friendListening) => {
    console.log("Opening modal for friend:", friend, friendListening);
    setSelectedFriend(friend);
    setIsModalOpen(true);
    setSelectedFriendListening(friendListening);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFriend(null); // Reset selected friend
  };

  return (
    <div>
      {/* Display the list of friends */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {friends && friends.friends && friends.friends.length > 0 ? (
          friends.friends.map((friend) => {
            const friendListening = currentlyListening.find(
              (listening) => listening.userId === friend
            );

            // **Add a return statement**
            return (
              <div
                key={friend}
                style={{
                  width: "100px",
                  padding: "5px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  textAlign: "center",
                  backgroundColor: "#fff",
                }}
                onClick={() => handleOpenModal(friend, friendListening)}
              >
                <h4 style={{ marginBottom: "5px", fontSize: "1rem" }}>
                  {friend || "Unknown user"}
                </h4>
                <p
                  style={{
                    marginBottom: "10px",
                    fontSize: "0.9rem",
                    color: "#666",
                  }}
                >
                  Currently listening to:
                </p>
                <img
                  src={
                    friendListening?.track?.albumCover ||
                    "https://via.placeholder.com/150"
                  }
                  alt={`${
                    friendListening?.track?.trackName || "Unknown track"
                  } album cover`}
                  style={{
                    width: "100%",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
                <p
                  style={{
                    marginTop: "10px",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                    color: "#444",
                  }}
                >
                  {friendListening?.track?.trackName || "Unknown track"}
                </p>
              </div>
            );
          })
        ) : (
          <p>Loading friends...</p>
        )}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <button
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "50px",
              height: "50px",
              border: "1px dashed #4285f4",
              borderRadius: "8px",
              cursor: "pointer",
              backgroundColor: "#f7f7f7",
            }}
            onClick={() => setIsModalOpen(true)}
          >
            +
          </button>
        </div>
      </div>

      {/* Modal for adding friends */}
      {isModalOpenAdd && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              maxWidth: "400px",
              width: "100%",
              textAlign: "center",
            }}
          >
            <h3>Add a Friend</h3>
            <input
              type="text"
              placeholder="Search for users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "80%",
                padding: "10px",
                margin: "10px 0",
                borderRadius: "4px",
                border: "1px solid #ddd",
              }}
            />
            <button
              onClick={handleSearch}
              style={{
                padding: "10px 20px",
                backgroundColor: "#4285f4",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Search
            </button>

            <div style={{ marginTop: "20px" }}>
              {searchResults.map((user) => (
                <div
                  key={user.userId}
                  style={{
                    marginBottom: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>{user.userId}</span>
                  <button
                    onClick={() => handleAddFriend(user.userId)}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#4CAF50",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Add Friend
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsModalOpenAdd(false)}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                backgroundColor: "red",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
      <LiveListenModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        friend={selectedFriend}
        friendListening={selectedFriendListening}
      />
    </div>
  );
}

export default FriendsFeed;
