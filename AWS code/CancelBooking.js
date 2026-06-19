import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "OPTIONS,DELETE", 
};

export const handler = async (event) => {
  if (event.requestContext?.http?.method === "OPTIONS") {
    return { statusCode: 200, headers: CORS_HEADERS, body: "" };
  }

  try {
    const body = JSON.parse(event.body);

    const command = new DeleteCommand({
      TableName: "Bookings",
      Key: {
        bookingId: body.bookingId 
      },
      ConditionExpression: "userId = :uid",
      ExpressionAttributeValues: {
        ":uid": body.userId 
      }
    });

    await docClient.send(command);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Booking cancelled successfully!" }),
    };

  } catch (error) {
    console.error("Cancel Booking Error:", error);

    if (error.name === "ConditionalCheckFailedException") {
      return {
        statusCode: 403, // 403 means "Forbidden"
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: "Unauthorized to cancel this booking or booking not found." }),
      };
    }

    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Internal Server Error", errorDetail: error.message }),
    };
  }
};