import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

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

    const getCommand = new GetCommand({
      TableName: "Users",
      Key: { email: body.email }
    });
    
    const response = await docClient.send(getCommand);
    const user = response.Item;

    if (!user || user.password !== body.currentPassword) {
      return {
        statusCode: 401,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: "Incorrect current password." }),
      };
    }

    const putCommand = new PutCommand({
      TableName: "Users",
      Item: {
        email: body.email,           
        userId: user.userId,         
        name: body.name,             
        address: body.address,       
        phone: body.phone,           
        password: body.password      
      }
    });
    
    await docClient.send(putCommand);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Profile updated successfully!" }),
    };

  } catch (error) {
    console.error("Error updating user:", error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Internal Server Error", errorDetail: error.message }),
    };
  }
};