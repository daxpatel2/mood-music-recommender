// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AuthSuccess from "./components/Authsuccess";
import "./App.css";
import UserProvider from "./contexts/UserContext";
import SearchResults from "./components/SearchResults";
import Home from "./components/Home";
import { DeviceProvider } from "./contexts/DeviceContext";
import { SocketProvider } from "./contexts/SocketContext";
function App() {
  return (
    <UserProvider>
      <DeviceProvider>
        <SocketProvider>
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
        </SocketProvider>
      </DeviceProvider>
    </UserProvider>
  );
}

export default App;
