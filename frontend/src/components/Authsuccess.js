import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AuthSuccess = () => {
  const [user, setUser] = useState(null); //need useState to rerender componet when the data changes
  // useState keeps its value(presists) across renders
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user data from the backend
    const fetchUser = async () => {
      try {
        const response = await axios.get("/user", { withCredentials: true });
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError(error);
      }
    };
    fetchUser();
  }, []); //empty dependency means that the components will only run once
  // if we add stuf [user]. It will run when ever the user changes

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button onClick={() => navigate("/")}>Go back</button>
      </div>
    );
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Welcome, {user.profile.displayName}!</h2>
      <img src={user.profile.photos[0].value} alt="User Avatar" />
      <p>Email: {user.profile.emails[0].value}</p>
    </div>
  );
};
export default AuthSuccess;