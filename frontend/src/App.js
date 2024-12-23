// src/App.js

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Auth from "./components/Auth";
import AuthSuccess from "./components/Authsuccess";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Mood Music Recommender</h1>
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/auth-success" element={<AuthSuccess />} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;
