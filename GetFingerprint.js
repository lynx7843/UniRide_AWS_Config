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
  const method = event.httpMethod || event.requestContext?.http?.method;

  if (method === "OPTIONS") {
    return { statusCode: 200, headers: CORS_HEADERS, body: "" };
  }

  try {
    const targetDriverId = event.queryStringParameters?.driverId;

    if (!targetDriverId) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: "Missing driverId in the URL!" }),
      };
    }

    const command = new GetCommand({
      TableName: "DriverFingerprints",
      Key: { driverId: targetDriverId } 
    });

    const response = await docClient.send(command);

    if (!response.Item) {
        return {
            statusCode: 404,
            headers: CORS_HEADERS,
            body: JSON.stringify({ message: "No fingerprint found for this driver." }),
        };
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(response.Item),
    };

  } catch (error) {
    console.error("Error fetching fingerprint:", error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Internal Server Error", errorDetail: error.message }),
    };
  }
};