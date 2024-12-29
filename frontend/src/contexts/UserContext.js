import React from "react";
import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const UserContext = createContext();

const UserProvider = ({ children }) => {
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
        console.log("error occured");
        console.error(error);
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
