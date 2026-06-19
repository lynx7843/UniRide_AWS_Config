import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
};

export const handler = async (event) => {
  const method = event.httpMethod || event.requestContext?.http?.method;

  if (method === "OPTIONS") {
    return { statusCode: 200, headers: CORS_HEADERS, body: "" };
  }

  try {
    if (method === "GET") {
      const command = new ScanCommand({
        TableName: "DriverVerifications"
      });
      const response = await docClient.send(command);
      
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(response.Items || []),
      };
    }

    if (method === "POST") {
      const body = JSON.parse(event.body);
      
      const command = new PutCommand({
        TableName: "DriverVerifications",
        Item: {
          trackerId: body.trackerId,
          timestamp: Date.now(),
          fingerprintId: body.fingerprintId
        },
      });

      await docClient.send(command);
      
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: "Verification logged successfully!" }),
      };
    }
    
    return {
        statusCode: 405,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: `Method ${method} Not Allowed` })
    };
    
  } catch (error) {
    console.error("Database Error:", error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Internal Server Error", errorDetail: error.message }),
    };
  }
};