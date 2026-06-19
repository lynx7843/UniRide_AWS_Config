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