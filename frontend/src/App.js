// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AuthSuccess from "./components/Authsuccess";
import "./App.css";
import UserProvider from "./contexts/UserContext";
import SearchResults from "./components/SearchResults";
import Home from "./components/Home";
import { DeviceProvider } from "./contexts/DeviceContext";

function App() {
  return (
    <UserProvider>
      <DeviceProvider>
        <Router>
          <div className="App">
            <header className="App-header">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/results" element={<SearchResults />} />
                <Route path="/auth-success" element={<AuthSuccess />} />
              </Routes>
            </header>
          </div>
        </Router>
      </DeviceProvider>
    </UserProvider>
  );
}

export default App;
