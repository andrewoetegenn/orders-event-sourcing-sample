import { EventBridgeClient, PutEventsCommand, PutEventsCommandInput } from "@aws-sdk/client-eventbridge";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { IEvent } from "./events";

const dynamo = new DynamoDBClient({});
export const dynamoDBClient = DynamoDBDocumentClient.from(dynamo);

const eventBridgeClient = new EventBridgeClient({});

export const publishEvent = async <T extends IEvent>(detailType: string, detail: T) => {
    const params: PutEventsCommandInput = {
        Entries: [
            {
                EventBusName: process.env.EVENT_BUS_NAME ?? "",
                Source: "Orders",
                DetailType: detailType,
                Detail: JSON.stringify(detail),
            },
        ],
    };

    await eventBridgeClient.send(new PutEventsCommand(params));
};
