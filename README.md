<div align="center">

  <h1>⚡ UniRide AWS Configuration</h1>
  
  <p>
    <b>Backend and hardware setup required for UniRide System.</b>
  </p>
  
  <h4>
    <a href="#-about">About</a> •
    <a href="#-requiremnts">Requirements</a> •
    <a href="#-dynamodb-setup">DynamoDB Setup</a> •
    <a href="#-lambda-functions">Lambda Functions</a> •
    <a href="#-iam-setup">IAM SetUp</a> •
    <a href="#-api-gateway">API Gateway</a> •
  </h4>
</div>

<br />

## ✨  About

This repository contains the initial setup required for the **UniRide** front-end (web and mobile applications) to work properly.

| Project | Repository |
|---|---|
|  UniRide | [lynx7843/UniRide](https://github.com/lynx7843/UniRide) |
|  UniRide Mobile | [lynx7843/UniRide_mobile](https://github.com/lynx7843/UniRide_mobile) |
|  UniRide Client | [lynx7843/UniRide_client](https://github.com/lynx7843/UniRide_client) |

## 🧾 Requirements

* AWS Cloud Server Account
* ESP32 Dev Board
* Neo 6M GPS Module
* AS608 Fingerprint Sensor
* Active-Low Buzzer Module
* Jumper Wires
* USB Data Cable

## 📖 DynamoDB Setup

<P>
   Manually Create the following tables with the listed strcture in the given json files. All other attributes required by the tables will be auto-filled with the use of lambda functions or hardware module.
</p>

* Bookings
```bash
{
  "bookingId": {
    "S": ""
  }
}
````

* DriverDetails
```bash
{
  "driverId": {
    "S": ""
  }
}
````

* DriverFingerprints
```bash
{
  "driverId": {
    "S": ""
  }
}
````

* DriverVerification
```bash
{
  "trackerId": {
    "S": ""
  },
  "timestamp": {
    "N": "0"
  }
}
````

* GPSTrackerData
```bash
{
  "deviceId": {
    "S": ""
  },
  "timestamp": {
    "N": "0"
  }
}
````

* ShuttleDetails
```bash
{
  "shuttleId": {
    "S": ""
  }
}
````

* ShuttleStatus
```bash
{
  "shuttleId": {
    "S": ""
  }
}
````

* ShuttleStops
```bash
{
  "shuttleId": {
    "S": ""
  }
}
````

* Staff
```bash
{
  "email": {
    "S": ""
  }
}
````

* Users
```bash
{
  "email": {
    "S": ""
  }
}
````

## 🛠️ Lambda Functions

* UpdateShuttleStatus
```bash
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
    
    const command = new PutCommand({
      TableName: "ShuttleStatus",
      Item: {
        shuttleId: body.shuttleId, 
        status: body.status,       
        timestamp: Date.now()      
      },
    });

    await docClient.send(command);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Shuttle status updated successfully!" }),
    };
  } catch (error) {
    console.error("Error updating shuttle status:", error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Internal Server Error", errorDetail: error.message }),
    };
  }
};
````

* RegisterShuttle
```bash
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
````

* GetDrivers
```bash
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
      new ScanCommand({ 
        TableName: "DriverDetails",
        ProjectionExpression: "driverId, driverName, email, licenseNumber, nic, phoneNumber, password"
      })
    );

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(response.Items),
    };
  } catch (error) {
    console.error("Error fetching drivers:", error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Internal Server Error", errorDetail: error.message }),
    };
  }
};
````

* SaveLocation
```bash
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
````

* UpdateUser
```bash
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
````

* GetShuttleStops
```bash
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

    const command = new GetCommand({
      TableName: "ShuttleStops",
      Key: { shuttleId: requestedShuttleId } 
    });

    const response = await docClient.send(command);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(response.Item ? response.Item.stops : []), 
    };

  } catch (error) {
    console.error("Error fetching stops:", error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
````

* GetShuttleStatus
```bash
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
````

* CreateBooking
```bash
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

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
    
    const getShuttleCommand = new GetCommand({
      TableName: "ShuttleDetails",
      Key: { shuttleId: body.shuttleId }
    });

    const shuttleResponse = await docClient.send(getShuttleCommand);
    const shuttle = shuttleResponse.Item;

    if (!shuttle) {
      return {
        statusCode: 404,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: "Shuttle not found." }),
      };
    }

    const requestedSeat = parseInt(body.seatNumber, 10);
    const maxCapacity = parseInt(shuttle.capacity, 10);

    if (requestedSeat < 1 || requestedSeat > maxCapacity) {
      return {
        statusCode: 400, 
        headers: CORS_HEADERS,
        body: JSON.stringify({ 
          message: `Invalid seat. Please choose a seat between 1 and ${maxCapacity}.` 
        }),
      };
    }

    const newBookingId = "BKG-" + Math.floor(1000 + Math.random() * 9000);

    const putCommand = new PutCommand({
      TableName: "Bookings",
      Item: {
        bookingId: newBookingId,
        userId: body.userId,       
        shuttleId: body.shuttleId, 
        date: body.date,           
        seatNumber: requestedSeat, 
        timestamp: Date.now()      
      },
    });

    await docClient.send(putCommand);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ 
        message: "Seat booked successfully!", 
        bookingId: newBookingId,
        seatNumber: requestedSeat
      }),
    };
  } catch (error) {
    console.error("Booking Error:", error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Internal Server Error", errorDetail: error.message }),
    };
  }
};
````

* GetFingerprint
```bash
````

* GetLocations
```bash
````

* LogFingerprint
```bash
````

* CancelBooking
```bash
````

* RegisterDriver
```bash
````

* RegisterFingerprint
```bash
````

* LoginUser
```bash
````

* GetUserBookings
```bash
````

* RegisterUser
```bash
````

* GetShuttles
```bash
````

