const AWS = require("aws-sdk");
const dotenv = require("dotenv").config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "us-east-2",
});

const dynamo = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = "SpotifyUsers";
const TRACKS_TABLE = "CurrentTracks"; // Replace with your actual table name

async function storeUserInDynamoDB({
  UserID,
  accessToken,
  refreshToken,
  displayName,
}) {
  try {
    await dynamo
      .put({
        TableName: "SpotifyUsers",
        Item: {
          UserID: UserID,
          AccessToken: accessToken,
          RefreshToken: refreshToken,
          DisplayName: displayName,
        },
      })
      .promise();
  } catch (err) {
    console.error(err);
    console.error(`Error storing user ${UserID}:`, err);
  }
}

async function getUserById({ UserID }) {
  const resp = await dynamo
    .get({
      TableName: USERS_TABLE,
      Key: { userId: UserID },
    })
    .promise();
  return resp.Item; // might be undefined if not found
}

async function getCurrentTrack(friendId) {
  const resp = await dynamo
    .get({
      TableName: TRACKS_TABLE,
      Key: { UserID: UserID },
    })
    .promise();
  return resp.Item; // might be undefined if that user isn't playing anything
}

// Export the functions using CommonJS
module.exports = {
  storeUserInDynamoDB,
  getUserById,
  getCurrentTrack,
};
