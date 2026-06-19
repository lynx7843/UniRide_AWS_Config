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
    
    const generatedDriverId = "DRV-" + Math.floor(1000 + Math.random() * 9000);

    const command = new PutCommand({
      TableName: "DriverDetails",
      Item: {
        driverId: generatedDriverId,   
        driverName: body.driverName,
        email: body.email,
        licenseNumber: body.licenseNumber,
        nic: body.nic,
        password: body.password,      
        phoneNumber: body.phoneNumber
      },
    });

    await docClient.send(command);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ 
          message: "Driver registered successfully!",
          driverId: generatedDriverId 
      }),
    };
  } catch (error) {
    console.error("Error registering driver:", error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Internal Server Error", errorDetail: error.message }),
    };
  }
};