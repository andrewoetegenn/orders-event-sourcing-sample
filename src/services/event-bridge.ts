import { EventBridgeClient, PutEventsCommand, PutEventsCommandInput } from "@aws-sdk/client-eventbridge";
import { IEvent } from "../events/event";

const client = new EventBridgeClient({});

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

    console.log(`PutEvents params: ${JSON.stringify(params)}`);

    await client.send(new PutEventsCommand(params));
};
