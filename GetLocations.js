import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

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
    const response = await docClient.send(
      new ScanCommand({ TableName: "GPSTrackerData" })
    );

    const sorted = response.Items.sort((a, b) => b.timestamp - a.timestamp);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(sorted),
    };
  } catch (error) {
    console.error("Error fetching locations:", error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Internal Server Error", errorDetail: error.message }),
    };
  }
};