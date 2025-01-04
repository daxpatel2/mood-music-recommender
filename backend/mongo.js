const { MongoClient } = require("mongodb");

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

async function fetchFriends(currentUserId) {
  const db = await connectToMongoDB();
  const usersCollection = db.collection("friends");

  const result = await usersCollection.findOne({ currentUserId });
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

module.exports = {
  connectToMongoDB,
  storeUserInMongoDB,
  getUserById,
  getUsers,
  addFriend,
  fetchFriends,
  fetchCurrentlyListening,
};
