import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "OPTIONS,POST",
};

export const handler = async (event) => {
  if (event.requestContext?.http?.method === "OPTIONS") {
    return { statusCode: 200, headers: CORS_HEADERS, body: "" };
  }

  try {
    const body = JSON.parse(event.body);
    
    const generatedShuttleId = "SHL-" + Math.floor(1000 + Math.random() * 9000);

    const command = new PutCommand({
      TableName: "ShuttleDetails",
      Item: {
        shuttleId: generatedShuttleId,
        capacity: body.capacity,       
        destination: body.destination, 
        deviceId: body.deviceId,       
        driverId: body.driverId,       
        vehicleNumber: body.vehicleNumber 
      },
    });

    await docClient.send(command);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ 
          message: "Shuttle registered successfully!",
          shuttleId: generatedShuttleId 
      }),
    };
  } catch (error) {
    console.error("Error registering shuttle:", error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Internal Server Error", errorDetail: error.message }),
    };
  }
};