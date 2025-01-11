import React, { useState, useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import "./Auth.css"; // Import the CSS file
import LoginModal from "./LoginModal";

// component that handles the login and logout by taking user to the backend routes
const Auth = () => {
  const { user } = useContext(UserContext);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="auth-container">
      {!user && (
        <button onClick={handleOpenModal} className="auth-login-button">
          Log in
        </button>
      )}
      <LoginModal isOpen={modalOpen} onClose={handleCloseModal} />
    </div>
  );
};

export default Auth;
