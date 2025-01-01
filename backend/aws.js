import AWS from "aws-sdk";
const dynamo = new AWS.DynamoDB.DocumentClient();

export async function storeUserInDynamoDB({
  userId,
  accessToken,
  refreshToken,
  displayName,
}) {
  await dynamo
    .put({
      TableName: "SpotifyUsers",
      Item: {
        UserId: userId,
        AccessToken: accessToken,
        RefreshToken: refreshToken,
        DisplayName: displayName,
      },
    })
    .promise();
  console.log(`User ${userId} stored in SpotifyUsers table`);
}

export async function getUserById({ userId }) {
  const resp = await dynamo
    .get({
      TableName: USERS_TABLE,
      Key: { UserId: userId },
    })
    .promise();
  return resp.Item; // might be undefined if not found
}

export async function getCurrentTrack(friendId) {
  const resp = await dynamo
    .get({
      TableName: TRACKS_TABLE,
      Key: { UserId: userId },
    })
    .promise();
  return resp.Item; // might be undefined if that user isn't playing anything
}
