import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "OPTIONS,GET",
};

export const handler = async (event) => {
  if (event.requestContext?.http?.method === "OPTIONS") {
    return { statusCode: 200, headers: CORS_HEADERS, body: "" };
  }

  try {
    const requestedShuttleId = event.queryStringParameters?.shuttleId;

    if (!requestedShuttleId) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: "Missing shuttleId in the URL!" }),
      };
    }

    const command = new GetCommand({
      TableName: "ShuttleStatus",
      Key: { shuttleId: requestedShuttleId } 
    });

    const response = await docClient.send(command);

    if (!response.Item) {
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ 
                shuttleId: requestedShuttleId, 
                status: "Offline", 
                message: "No status set yet." 
            }),
        };
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(response.Item),
    };

  } catch (error) {
    console.error("Error fetching shuttle status:", error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Internal Server Error", errorDetail: error.message }),
    };
  }
};