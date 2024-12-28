const express = require("express");
const session = require("express-session");
const passport = require("passport");
const SpotifyStrategy = require("passport-spotify").Strategy;
const dotenv = require("dotenv");
const cors = require("cors");
const axios = require("axios");

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
    ],
    showDialog: true,
  })
);

// Callback Route
app.get(
  "/callback",
  passport.authenticate("spotify", { failureRedirect: "/" }),
  (req, res) => {
    console.log(`user is ${req.user}`);
    // Successful authentication, redirect to frontend with user data
    res.redirect(`${process.env.FRONTEND_URL}/auth-success`);
    // res.redirect("http://localhost:5000/auth-success");
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
// Start the Server
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
