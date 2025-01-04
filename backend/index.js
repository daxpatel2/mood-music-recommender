const express = require("express");
const session = require("express-session");
const passport = require("passport");
const SpotifyStrategy = require("passport-spotify").Strategy;
const dotenv = require("dotenv");
const cors = require("cors");
const axios = require("axios");
const {
  storeUserInMongoDB,
  getUsers,
  addFriend,
  fetchFriends,
  fetchCurrentlyListening,
} = require("./mongo");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // Add this to parse incoming JSON requests

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
      const displayName = profile.displayName || profile.username || "Unknown";

      // 3) Store user in DB
      await storeUserInMongoDB({
        userId: profile.id,
        accessToken: accessToken,
        refreshToken: refreshToken,
        displayName: displayName,
      });

      res.redirect(`${process.env.FRONTEND_URL}/auth-success`);
    } catch (err) {
      console.error("Error in callback route:", error.message);
      res.status(500).send("An error occurred during authentication.");
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

//route to fetch music from spotify
app.get("/api/recommendations", async (req, res) => {
  const query = req.query.query;
  const user = req.user;

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
app.get("/friends-feed", async (req, res) => {
  const { profile } = req.user;
  if (!profile) {
    return res.status(400).json({ error: "Missing UserID" });
  }

  try {
    const response = await fetchFriends(profile.id);
    if (!response) {
      console.error("no database response finding friends");
      return;
    }
    res.status(200).json(response);
    console.log("response from friends-feed route");
    return response;
  } catch (err) {
    console.error("Error in friends-feed route:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/find-friends", async (req, res) => {
  const searchQuery = req.query.query;

  if (!searchQuery) {
    console.error("no search query found in find-friends");
    return;
  }
  try {
    const users = await getUsers(searchQuery);
    res.json(users);
  } catch (err) {
    console.error(err);
    console.log(
      "error occured trying to fetch the users from database during friends search"
    );
  }
});

app.post("/add-friends", async (req, res) => {
  const { friendId, userId } = req.body; // Extract friendId and userId from the request body

  if (!friendId || !userId) {
    return res.status(400).json({ error: "Missing friendId or userId" });
  }

  try {
    const result = await addFriend(friendId, userId); // Call your database function
    res.status(200).json({ message: "Friend added successfully", result });
  } catch (err) {
    console.error("Error occurred trying to add the friend:", err);
    res
      .status(500)
      .json({ error: "An error occurred while adding the friend" });
  }
});

app.post("/currently-listening", async (req, res) => {
  console.log("currently-listening route");
  try {
    const { friendId } = req.body;
    const currentTrack = await fetchCurrentlyListening(friendId);
    console.log("current track from currently-listening route", currentTrack);
    res.json(currentTrack);
  } catch (err) {
    console.error("Error fetching currently listening:", err);
    res.status(500).json({ message: "Failed to fetch currently listening" });
  }
});

/**
 * START THE SERVER
 */

// Start the Server
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
