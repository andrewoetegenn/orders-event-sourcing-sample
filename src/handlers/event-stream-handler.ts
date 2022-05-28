import { DynamoDBRecord, DynamoDBStreamHandler } from "aws-lambda";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { EventBridgeClient, PutEventsCommand, PutEventsCommandInput } from "@aws-sdk/client-eventbridge";
import { IEvent } from "../core/event";

const client = new EventBridgeClient({});

export const handler: DynamoDBStreamHandler = async (event) => {
    for (const record of event.Records) {
        const event = extractEvent(record);

        const params: PutEventsCommandInput = {
            Entries: [
                {
                    EventBusName: process.env.EVENT_BUS_NAME ?? "",
                    Source: "orders",
                    DetailType: event.eventName,
                    Detail: JSON.stringify(event),
                },
            ],
        };

        await client.send(new PutEventsCommand(params));
    }
};

const extractEvent = (record: DynamoDBRecord): IEvent => {
    if (!record.dynamodb?.NewImage) {
        throw new Error("Invalid dynamo db record");
    }

    const item = unmarshall(
        record.dynamodb?.NewImage as {
            [key: string]: AttributeValue;
        }
    );

    return JSON.parse(item.event);
};
