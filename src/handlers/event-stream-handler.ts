import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { DynamoDBStreamHandler } from "aws-lambda";
import { publishEvent } from "../services";

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

        await publishEvent(item.type, JSON.parse(item.event));
    }
};