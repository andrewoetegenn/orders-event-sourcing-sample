import { DynamoDBStreamHandler } from "aws-lambda";
import { publishEvent } from "../services/event-bridge";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { AttributeValue } from "@aws-sdk/client-dynamodb";

export const eventStreamHandler: DynamoDBStreamHandler = async (event) => {
    for (const record of event.Records) {
        if (!record.dynamodb?.NewImage) {
            throw new Error("Invalid dynamo db record");
        }

        const item = unmarshall(
            record.dynamodb?.NewImage as {
                [key: string]: AttributeValue;
            }
        );

        await publishEvent(item.name, JSON.parse(item.event));
    }
};
