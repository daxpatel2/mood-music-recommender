import React from "react";
import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [currentlyListening, setCurrentlyListening] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/user", {
          withCredentials: true,
        });
        setUser(response.data);
      } catch {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axios.get("/friends-feed", {
          withCredentials: true,
        });
        setFriends(response.data);
        console.log("friends = ", response.data);
      } catch (err) {
        console.error("error fetching friends in the context:" + err.message);
      }
    };
    if (user) {
      fetchFriends();
    }
  }, [user]);

  useEffect(() => {
    const fetchCurrentlyListening = async () => {
      console.log("Fetching currently listening tracks for friends");
      if (!friends || !friends.friends || friends.friends.length === 0) {
        console.log("No friends to fetch currently listening for");
        return;
      }
      try {
        // Use Promise.all to fetch data for all friends in parallel
        const responses = await Promise.all(
          friends.friends.map((friendId) =>
            axios.post("/currently-listening", { friendId })
          )
        );

        // Combine all results into a single array
        const allData = responses.map((response) => response.data);
        setCurrentlyListening(allData); // Update state with combined data
      } catch (error) {
        console.error("Error fetching currently listening:", error);
      }
    };

    const intervalId = setInterval(() => {
      fetchCurrentlyListening();
    }, 180000); // Fetch every 3 minutes

    if (friends && friends.friends) {
      fetchCurrentlyListening(); // Call the function only if friends exist
    }

    return () => clearInterval(intervalId);
  }, [friends]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        friends,
        setFriends,
        currentlyListening,
        setCurrentlyListening,
      }}
    >
      {!loading && children}
    </UserContext.Provider>
  );
};

export default UserProvider;
