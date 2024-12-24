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
        console.log("reached authsuccess");
        const response = await axios.get("/user", { withCredentials: true }); //goes to localhost://5000 because we added that in our proxy in package.json

        setUser(response.data);
      } catch {
        console.error(error);
      }
    };
    fetchUser();
  }, []); //empty dependency means that the components will only run once
  // if we add stuf [user]. It will run whenever the user changes

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button onClick={() => navigate("/")}>Go back</button>
      </div>
    );
  }
  //it renders the loading state and not the others meaning that user in authjs never changes to user
  if (!user) {
    return <div>Loading...</div>;
  } else {
    return (
      <div>
        <h2>Welcome, {user.profile.displayName}!</h2>
        <img src={user.profile.photos[0].value} alt="User Avatar" />
        <p>Email: {user.profile.emails[0].value}</p>
      </div>
    );
  }
};
export default AuthSuccess;
