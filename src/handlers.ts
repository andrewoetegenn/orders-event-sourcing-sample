import { APIGatewayProxyHandlerV2, DynamoDBRecord, DynamoDBStreamHandler, EventBridgeHandler } from "aws-lambda";
import { PlaceOrderCommand } from "./commands";
import { Order } from "./domain";
import { IEvent, OrderPlaced } from "./events";
import { publishEvent } from "./services/event-bridge";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { ordersRepository } from "./repositories";

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

// Command Handlers
export const placeOrderHandler: APIGatewayProxyHandlerV2 = async (event) => {
    if (!event.body) {
        return {
            statusCode: 400,
        };
    }

    const command = JSON.parse(event.body) as PlaceOrderCommand;
    const order = new Order(command.orderId);
    await ordersRepository.save(order);

    return {
        statusCode: 201,
    };
};

// Event Handlers
export const orderPlacedHandler: EventBridgeHandler<"OrderPlaced", OrderPlaced, void> = async (event) => {
    console.log(`Event: ${JSON.stringify(event.detail)}`);
};
