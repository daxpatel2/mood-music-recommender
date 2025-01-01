const express = require("express");
const session = require("express-session");
const passport = require("passport");
const SpotifyStrategy = require("passport-spotify").Strategy;
const dotenv = require("dotenv");
const cors = require("cors");
const axios = require("axios");
import { storeUserInDynamoDB, getUserById, getCurrentTrack } from "./aws";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true, // Allow cookies to be sent
  })
);

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "random_secrete_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Ensure cookies are secure in production
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport Serialization
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Configure Spotify Strategy
passport.use(
  new SpotifyStrategy(
    {
      clientID: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      callbackURL: process.env.SPOTIFY_CALLBACK_URL,
    },
    function (accessToken, refreshToken, expires_in, profile, done) {
      // You can save the profile info and tokens to your database here
      // For simplicity, we'll just return the profile and tokens
      return done(null, { profile, accessToken, refreshToken });
    }
  )
);

// Routes

// Home Route
app.get("/", (req, res) => {
  res.send("Mood Music Recommender Backend");
});

// Authentication Route
app.get(
  "/login",
  passport.authenticate("spotify", {
    scope: [
      "user-read-email",
      "playlist-modify-public",
      "playlist-modify-private",
      "user-read-playback-state",
      "user-modify-playback-state",
      "streaming", // <-- Important for playback!
    ],
    showDialog: true,
  })
);

// Callback Route
app.get(
  "/callback",
  passport.authenticate("spotify", { failureRedirect: "/" }),
  async (req, res) => {
    try {
      const { profile, accessToken, refreshToken } = req.user;
      // 2) Prepare user data for DB
      const userId = `spotify:${profile.id}`; // e.g., "spotify:12345"
      const displayName = profile.displayName || profile.username || "Unknown";

      // 3) Store user in DB
      await storeUserInDynamoDB({
        UserId: userId,
        AccessToken: accessToken,
        RefreshToken: refreshToken,
        DisplayName: displayName,
      });
      // Successful authentication, redirect to frontend with user data
      // we can change this to simply going to homepage instead of auth success if we needed
      res.redirect(`${process.env.FRONTEND_URL}/auth-success`);
    } catch (err) {
      console.error(err);
      console.log("error occured from the app.get /callback backend route");
    }
  }
);

// Logout Route
app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect(process.env.FRONTEND_URL);
  });
});

app.get("/auth", (req, res) => {
  res.send("Current user is: " + req.user);
});

// Get Authenticated User Data
app.get("/user", (req, res) => {
  if (req.isAuthenticated()) {
    const { profile, accessToken } = req.user;
    res.json({ profile, accessToken });
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});

/**
 * Fetches the Spotify user's profile using an access token.
 * Returns an object with at least: { id, display_name, email, ... }
 *
 * @param {string} accessToken - A valid Spotify API access token
 * @returns {Object} - The user's Spotify profile data
 */
export const getSpotifyProfile = async () => {
  try {
    const response = await axios.get("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response;
  } catch (err) {
    console.error("Failed to fetch Spotify user profile:", err.message);
    throw new Error("Could not fetch user profile from Spotify");
  }
};

//route to fetch music from spotify
app.get("/api/recommendations", async (req, res) => {
  const query = req.query.query;
  const user = req.user;
  console.log("Query:", query);
  console.log("User:", user);

  if (!query) {
    return res.status(400).json({ message: "Query parameter is required." });
  }

  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        query
      )}&type=track&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${req.user.accessToken}`,
        },
      }
    );
    res.json({ tracks: response.data.tracks.items });
  } catch (err) {
    console.error("Error fetching recommendations:", err.message);
    res.status(500).json({ message: "Failed to fetch recommendations" });
  }
});

// route to get friends-feed
app.get("/api/friends-feed", async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    // 1) Lookup the user
    const userItem = await getUserById(userId);

    if (!userItem) {
      return res.status(404).json({ error: "User not found" });
    }

    const friends = userItem.Friends || [];
    if (friends.length === 0) {
      return res.json([]); // no friends, empty array
    }

    // 2) For each friend, fetch their current track
    const friendsData = [];
    for (const friendId of friends) {
      const track = await getCurrentTrack(friendId); // fetch from "UserCurrentTrack"
      if (track) {
        friendsData.push({
          friendId,
          trackId: track.TrackId,
          trackName: track.TrackName,
          albumName: track.AlbumName,
          artists: track.Artists,
          lastUpdated: track.LastUpdated,
        });
      } else {
        friendsData.push({
          friendId,
          trackId: null,
        });
      }
    }
    res.json(friendsData);
  } catch (err) {
    console.error("Error in friends-feed route:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});