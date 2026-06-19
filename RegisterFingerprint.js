import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "DriverFingerprints";

export const handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { driverId, templateData } = body;

        if (!driverId || !templateData) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Missing driverId or templateData" }),
            };
        }

        const params = {
            TableName: tableName,
            Item: {
                driverId: driverId.toString(), 
                templateData: templateData,
                enrollmentDate: new Date().toISOString()
            }
        };

        await dynamo.send(new PutCommand(params));

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: `Fingerprint metadata saved successfully for driver ${driverId}` }),
        };

    } catch (error) {
        console.error("Error saving fingerprint:", error);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Internal server error", error: error.message }),
        };
    }
};