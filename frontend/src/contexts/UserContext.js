import React from "react";
import axios from "axios";
import { createContext, useEffect, useState, children } from "react";

export const UserContext = createContext();

const UserProvider = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //when the component mounts, that is...useEffect

  //takes a function that we want to fun, in our case we will just create a default one
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/user", {
          withCredentials: true,
        });
        setUser(response.data);
      } catch {
        setError("An error occurred");
        setUser(null);
        console.error(`error occurred fetching user: ${error}`);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {!loading && children}
    </UserContext.Provider>
  );
};

export default UserProvider;
