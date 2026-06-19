import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "OPTIONS,POST",
};

async function checkTableForEmail(tableName, email) {
  try {
    const command = new GetCommand({
      TableName: tableName,
      Key: { email: email }
    });
    const response = await docClient.send(command);
    return response.Item; 
  } catch (error) {
    console.error(`Error checking ${tableName}:`, error);
    return null;
  }
}

export const handler = async (event) => {
  if (event.requestContext?.http?.method === "OPTIONS") {
    return { statusCode: 200, headers: CORS_HEADERS, body: "" };
  }

  try {
    const body = JSON.parse(event.body);
    const loginEmail = body.email;
    const loginPassword = body.password;

    let foundUser = null;
    let userRole = "";

    foundUser = await checkTableForEmail("Users", loginEmail);
    if (foundUser) {
        userRole = "student";
    } 
    
    if (!foundUser) {
        foundUser = await checkTableForEmail("Staff", loginEmail);
        if (foundUser) {
            userRole = "admin";
        }
    }

    if (!foundUser) {
        const scanCommand = new ScanCommand({
            TableName: "DriverDetails",
            FilterExpression: "email = :e",
            ExpressionAttributeValues: { ":e": loginEmail }
        });
        const driverResponse = await docClient.send(scanCommand);
        
        if (driverResponse.Items && driverResponse.Items.length > 0) {
            foundUser = driverResponse.Items[0];
            userRole = "driver";
        }
    }

    if (!foundUser || foundUser.password !== loginPassword) {
      return {
        statusCode: 401,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: "Invalid email or password." }),
      };
    }

    delete foundUser.password;

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ 
          message: "Login successful!", 
          userData: foundUser,
          role: userRole 
      }),
    };

  } catch (error) {
    console.error("Login Error:", error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};