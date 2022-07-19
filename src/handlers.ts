import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { DynamoDBStreamHandler } from "aws-lambda";
import { publishEvent } from "./services";

const eventStreamHandler: DynamoDBStreamHandler = async (event) => {
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

import { addLineItemToOrderHandler } from "./command-handlers/add-line-item-to-order-handler";
import { approveOrderHandler } from "./command-handlers/approve-order-handler";
import { placeOrderHandler } from "./command-handlers/place-order-handler";

import { lineItemAddedToOrderHandler } from "./event-handlers/line-item-added-to-order-handler";
import { paymentReceivedHandler } from "./event-handlers/payment-received-handler";
import { orderApprovedHandler } from "./event-handlers/order-approved-handler";
import { orderPlacedHandler } from "./event-handlers/order-placed-handler";

import { getOrderHandler } from "./query-handlers/get-order-handler";

export {
    addLineItemToOrderHandler,
    approveOrderHandler,
    placeOrderHandler,
    lineItemAddedToOrderHandler,
    paymentReceivedHandler,
    orderApprovedHandler,
    orderPlacedHandler,
    getOrderHandler,
    eventStreamHandler,
};
