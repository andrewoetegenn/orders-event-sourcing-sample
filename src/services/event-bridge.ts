import { EventBridgeClient, PutEventsCommand, PutEventsCommandInput } from "@aws-sdk/client-eventbridge";
import { Event } from "../events/events";

const client = new EventBridgeClient({});

export const publishEvent = async <T extends Event>(detailType: string, detail: T) => {
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

    await client.send(new PutEventsCommand(params));
};
