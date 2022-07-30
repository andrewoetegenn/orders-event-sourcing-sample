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

// Command Handlers
import { addLineItemToOrderHandler } from "./command-handlers/add-line-item-to-order-handler";
import { approveOrderHandler } from "./command-handlers/approve-order-handler";
import { placeOrderHandler } from "./command-handlers/place-order-handler";

// Domain Event Handlers
import { lineItemAddedToOrderHandler } from "./domain-event-handlers/line-item-added-to-order-handler";
import { orderPaymentReceivedHandler } from "./domain-event-handlers/orders-payment-received-handler";
import { orderDispatchedHandler } from "./domain-event-handlers/order-dispatched-handler";
import { orderCompletedHandler } from "./domain-event-handlers/order-completed-handler";
import { orderDeliveredHandler } from "./domain-event-handlers/order-delivered-handler";
import { orderApprovedHandler } from "./domain-event-handlers/order-approved-handler";
import { orderPlacedHandler } from "./domain-event-handlers/order-placed-handler";
import { orderPaidHandler } from "./domain-event-handlers/order-paid-handler";

// Integration Event Handlers
import { shipmentDispatchedHandler } from "./integration-event-handlers/shipment-dispatched-handler";
import { shipmentDeliveredHandler } from "./integration-event-handlers/shipment-delivered-handler";
import { paymentReceivedHandler } from "./integration-event-handlers/payment-received-handler";

// Query Handlers
import { getOrderDetailHandler } from "./query-handlers/get-order-detail-handler";

export {
    addLineItemToOrderHandler,
    approveOrderHandler,
    placeOrderHandler,
    lineItemAddedToOrderHandler,
    orderPaymentReceivedHandler,
    orderDispatchedHandler,
    orderCompletedHandler,
    orderDeliveredHandler,
    orderPaidHandler,
    shipmentDispatchedHandler,
    shipmentDeliveredHandler,
    paymentReceivedHandler,
    orderApprovedHandler,
    orderPlacedHandler,
    getOrderDetailHandler,
    eventStreamHandler,
};
