import React from "react";
import { UserContext } from "../contexts/UserContext";

const UserProfile = () => {
  const { user } = React.useContext(UserContext);

  if (!user) {
    return null;
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <img
        src={user.profile.photos[0].value}
        alt="User Avatar"
        style={{ borderRadius: "50%", width: "100px", height: "100px" }}
      />
      <h3>{user.profile.displayName}</h3>
      <p>{user.profile.emails && user.profile.emails[0].value}</p>
    </div>
  );
};

export default UserProfile;
