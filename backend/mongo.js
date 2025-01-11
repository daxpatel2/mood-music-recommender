const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require("uuid");

const uri =
  "mongodb+srv://daxpatel:Jitendrapatel12@cluster0.iigjp.mongodb.net/"; // Replace with your MongoDB URI
const client = new MongoClient(uri);

let db;

async function connectToMongoDB() {
  if (!db) {
    try {
      await client.connect();
      console.log("Connected to MongoDB");
      db = client.db("mood_music_recommender"); // Replace with your database name
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      throw error;
    }
  }
  return db;
}

async function storeUserInMongoDB({
  userId,
  accessToken,
  refreshToken,
  displayName,
  provider,
}) {
  const db = await connectToMongoDB();
  const usersCollection = db.collection("users");

  const result = await usersCollection.updateOne(
    { userId }, // Find user by userId
    {
      $set: {
        accessToken,
        refreshToken,
        displayName,
        provider,
      },
    },
    { upsert: true } // Create a new document if user does not exist
  );

  console.log(`User ${userId} stored in MongoDB`);
  return result;
}

async function getUserById(userId) {
  const db = await connectToMongoDB();
  const usersCollection = db.collection("users");

  const user = await usersCollection.findOne({ userId });
  return user; // Returns null if not found
}

async function getUsers(searchQuery) {
  const db = await connectToMongoDB();
  const usersCollection = db.collection("users");

  const user = await usersCollection
    .find({
      userId: { $regex: new RegExp(searchQuery, "i") },
    })
    .toArray();
  return user; // Returns null if not found
}

async function addFriend(friendId, userId) {
  const db = await connectToMongoDB();
  const usersCollection = db.collection("friends");

  const result = await usersCollection.updateOne(
    { userId }, // Find user by userId
    {
      $addToSet: {
        // Add the friendId to the friends array if it doesn't already exist
        friends: friendId,
      },
    },
    { upsert: true } // Create a new document if user does not exist
  );
  return result;
}

async function fetchFriends(userId) {
  const db = await connectToMongoDB();
  const friendsCollection = db.collection("friends");

  const result = await friendsCollection.findOne({ userId });
  return result;
}

// fetches the current track for all users in the database
// were going to call this database function repeatly to get the current track for all users
// cron job every 3 minutes
async function fetchCurrentlyListening(friendId) {
  const db = await connectToMongoDB();
  const tracksCollection = db.collection("tracks");
  console.log("fetching currently listening tracks for user:", friendId);
  try {
    // Fetch all users
    const user = await tracksCollection.findOne({ userId: friendId });

    if (!user) {
      throw new Error("Item not found in the database");
    }

    return user;
  } catch (error) {
    console.error("Error fetching tracks:", error.message);
    throw new Error("Failed to fetch currently listening tracks");
  }
}

async function roomIdGenerator(roomId) {
  const db = await connectToMongoDB();
  const roomsCollection = db.collection("rooms");

  // Fetch the room data
  try {
    const room = await roomsCollection.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    return room;
  } catch (error) {
    console.error("Error fetching room data:", error.message);
    return res.status(500).json({ message: "Failed to fetch room data" });
  }
}

async function storeCurrentlyListening({ userId, track, deviceId }) {
  const db = await connectToMongoDB();
  const tracksCollection = db.collection("tracks");
  console.log("storing currently listening track for user:", userId);

  try {
    // Validate the track object
    if (
      !track ||
      !track.name ||
      !track.uri ||
      !track.album?.name ||
      !track.album?.images?.[0]?.url ||
      !track.artists?.[0]?.name
    ) {
      throw new Error("Invalid track object");
    }

    const trackObject = {
      trackName: track.name,
      trackUri: track.uri,
      albumName: track.album.name,
      artistName: track.artists[0].name,
      albumCover: track.album.images[0].url,
    };

    // Update or insert the track document
    const result = await tracksCollection.updateOne(
      { userId }, // Find user by userId
      {
        $set: {
          track: trackObject,
          deviceId, // Optionally store the deviceId if needed
          updatedAt: new Date(), // Timestamp for tracking updates
        },
      },
      { upsert: true } // Create a new document if user does not exist
    );

    console.log(`User ${userId}'s track info updated successfully in MongoDB.`);
    return { success: true, result };
  } catch (error) {
    console.error(
      `Error storing track info for user ${userId}:`,
      error.message
    );
    return { success: false, error: error.message };
  }
}

async function createListeningRoom({ room }) {
  const db = await connectToMongoDB();
  const roomsCollection = db.collection("rooms");
  try {
    const result = await roomsCollection.insertOne(room);
    return result;
  } catch (error) {
    console.error("Error creating room:", error.message);
  }
}

async function getRoomById(roomId, userId) {
  const db = await connectToMongoDB();
  const roomsCollection = db.collection("rooms");
  // Validate the room exists
  try {
    const room = await roomsCollection.findOne({ roomId });
    if (!room) {
      console.error(`Room ${roomId} not found`);
      return res.status(404).json({ message: "Room not found" });
    }
    // Add the user to the participants list if not already present
    if (!room.participants.includes(userId)) {
      await roomsCollection.updateOne(
        { roomId },
        { $push: { participants: userId }, $set: { updatedAt: new Date() } }
      );
    }
    console.log(`User ${userId} joined room ${roomId}`);
    return true;
  } catch (error) {
    console.error("Error joining room:", error.message);
    return res.status(500).json({ message: "Failed to join room" });
  }
}

async function createRoom({ userId }) {
  const db = await connectToMongoDB();
  const roomsCollection = db.collection("rooms");

  // Check if a room already exists for the user
  let room = await roomsCollection.findOne({ userId });

  if (!room) {
    // Create a new room if it doesn't exist
    const roomId = uuidv4(); // Generate a unique room ID
    await roomsCollection.insertOne({
      roomId,
      userId,
      participants: [userId], // Add the current user as the first participant, when others join add the as well
      createdAt: new Date(),
    });

    room = { roomId };
    return room;
  } else {
    // Add the user to the room participants if not already in the room
    await roomsCollection.updateOne(
      { roomId: room.roomId },
      { $addToSet: { participants: userId } }
    );
    console.log(`User ${userId} joined room ${room.roomId}`);
    return room.roomId;
  }
}

async function fetchRoomData(roomId) {
  const db = await connectToMongoDB();
  const roomsCollection = db.collection("rooms");

  // Fetch the room data
  try {
    const room = await roomsCollection.findOne({
      roomId,
    });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    return room;
  } catch (error) {
    console.error("Error fetching room data:", error.message);
    return res.status(500).json({ message: "Failed to fetch room data" });
  }
}

module.exports = {
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
};
