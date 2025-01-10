const express = require("express");
const http = require("http");
const session = require("express-session");
const passport = require("passport");
const SpotifyStrategy = require("passport-spotify").Strategy;
const dotenv = require("dotenv");
const cors = require("cors");
const axios = require("axios");
const {
  storeUserInMongoDB,
  getUserById,
  getUsers,
  addFriend,
  fetchFriends,
  fetchCurrentlyListening,
  storeCurrentlyListening,
  createListeningRoom,
  getRoomById,
  roomIdGenerator,
  createRoom,
  fetchRoomData,
} = require("./mongo");
const createWebSocketServer = require("./websocket");
const { Server } = require("socket.io");

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
    async function (accessToken, refreshToken, expires_in, profile, done) {
      try {
        // Ensure the accessToken is valid by making a test call
        const response = await axios.get("https://api.spotify.com/v1/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        return done(null, { profile, accessToken, refreshToken });
      } catch (err) {
        console.error("Error during Spotify profile fetch:", err.message);
        return done(err);
      }
    }
  )
);

// Home Route
app.get("/", (req, res) => {
  res.send("Backend Server is running");
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
      console.error("Error in callback route:", err.message);
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
  try {
    const { friendId } = req.body;
    const currentTrack = await fetchCurrentlyListening(friendId);
    res.json(currentTrack);
  } catch (err) {
    console.error("Error fetching currently listening:", err);
    res.status(500).json({ message: "Failed to fetch currently listening" });
  }
});

app.post("/update-currentTrack", async (req, res) => {
  console.log("update-currentTrack route");
  try {
    const { track, deviceId, user } = req.body;
    console.log("trackUri and deviceId from update-currentTrack route", {
      track,
      deviceId,
      user,
    });
    console.log("user.profile.id", user.profile.id);
    const result = await storeCurrentlyListening({
      userId: user.profile.id,
      track,
      deviceId,
    });
    res.json({ message: "Current track updated successfully" });
  } catch (err) {
    console.error("Error updating current track:", err);
    res.status(500).json({ message: "Failed to update current track" });
  }
});

/**
 *
 * New endpoints for listening rooms
 */
app.post("/join-room", async (req, res) => {
  try {
    const { userId, roomId } = req.body;

    const result = await getRoomById(roomId, userId);

    if (!result) {
      return res.status(404).json({ message: "Room not found" });
    }
    console.log(`User ${userId} joined room ${roomId}`);
    res.status(200).json({ message: "Joined room successfully", room });
  } catch (error) {
    console.error("Error joining room:", error.message);
    res.status(500).json({ message: "Failed to join room" });
  }
});

app.get("/room/:roomId", async (req, res) => {
  const { roomId } = req.params;

  try {
    const room = await roomIdGenerator(roomId);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json({
      roomId: room.roomId,
      currentTrack: room.currentTrack || null,
      updatedAt: room.updatedAt,
    });
  } catch (err) {
    console.error("Error fetching room data:", err);
    res.status(500).json({ message: "Failed to fetch room data" });
  }
});

// Create an HTTP server
const server = http.createServer(app);
const io = createWebSocketServer(server); // Attach WebSocket server

const activeRooms = {}; // In-memory storage for room states

// Handle WebSocket connections
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle joining a room
  socket.on("joinRoom", async (roomId) => {
    // console.log(`User ${socket.id} joined room: ${roomId}`);

    // Add the user to the room
    socket.join(roomId);

    // Fetch room data and send it to the user
    if (!activeRooms[roomId]) {
      activeRooms[roomId] = await fetchRoomData(roomId);
    }

    const roomData = activeRooms[roomId];
    socket.emit("roomData", roomData);
  });

  // Handle leaving a room
  socket.on("leaveRoom", (roomId) => {
    console.log(`User ${socket.id} left room: ${roomId}`);
    socket.leave(roomId);
  });

  // Handle track updates in a room
  socket.on("updateTrack", async ({ roomId, track }) => {
    console.log(`Updating track for room ${roomId}:`, track);

    // Update the room state in memory
    if (!activeRooms[roomId]) {
      activeRooms[roomId] = await fetchRoomData(roomId);
    }

    activeRooms[roomId].currentTrack = track;

    // Update the database
    await updateRoomTrack(roomId, track);

    // Broadcast the updated track to all users in the room
    io.to(roomId).emit("trackUpdated", track);
    console.log("Emitted current track update:", track);
  });

  socket.on("getParticipants", async (roomId) => {
    console.log("Fetching participants for room:", roomId);
    if (!roomId) {
      console.error("No room found for getParticipants");
      return;
    }

    const room = activeRooms[roomId];
    if (!room) {
      console.error("No room data found for getParticipants");
      return;
    }

    const participants = room.participants;
    console.log("Participants in room:", participants);

    // Send the participants list to all users in the room
    io.to(roomId).emit("update-participants", { participants });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

app.post("/live-listen", async (req, res) => {
  const { friendId } = req.body;
  const userId = req.user?.profile?.id;

  if (!friendId || !userId) {
    console.log("Missing friendId or userId");
    return res
      .status(400)
      .json({ success: false, message: "Missing friendId or userId" });
  }

  console.log(
    "Creating live listen room for user:",
    userId,
    "and friend:",
    friendId
  );

  try {
    const response = await createRoom({ userId });
    return res.json(response);
  } catch (error) {
    console.error("Error handling live listen request:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to join live listen room" });
  }
});

app.post("create-room", async (req, res) => {
  const { userId } = req.body;
  try {
    const response = await createRoom({ userId });
    res.json(response);
  } catch (err) {
    console.error("Error creating room:", err.message);
    res.status(500).json({ message: "Failed to create room" });
  }
});

/**
 * START THE SERVER
 */
//app.listen
server.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
