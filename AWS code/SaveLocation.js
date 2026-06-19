import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    
    const command = new PutCommand({
      TableName: "GPSTrackerData",
      Item: {
        deviceId: body.deviceId,
        timestamp: Date.now(),
        lat: body.lat,
        lng: body.lng
      },
    });

    await docClient.send(command);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Location Saved Successfully!" }),
    };
    
  } catch (error) {
    console.error("Database Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: "Internal Server Error", 
        errorDetail: error.message
      }),
    };
  }
};