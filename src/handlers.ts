import { Order as OrderProjection, OrderLineItem as OrderLineItemProjection, OrderStatus as OrderStatusProjection } from "./projections";
import { APIGatewayProxyHandlerV2, DynamoDBStreamHandler, EventBridgeHandler } from "aws-lambda";
import { ordersRepository, ordersQueryStore } from "./persistance";
import { LineItemAddedToOrder, OrderPlaced } from "./events";
import { AddLineItemToOrder, PlaceOrder } from "./commands";
import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { Order, OrderLineItem } from "./domain";
import { publishEvent } from "./services";
import { round } from "./utils";

export const placeOrderHandler: APIGatewayProxyHandlerV2 = async (event) => {
    if (!event.body) {
        return {
            statusCode: 400,
        };
    }

    const command = JSON.parse(event.body) as PlaceOrder;
    const order = Order.place(command.lineItems.map((x) => new OrderLineItem(x.sku, x.quantity, x.unitPrice)));
    await ordersRepository.save(order);

    return {
        statusCode: 201,
        body: JSON.stringify({
            orderId: order.getAggregateId(),
        }),
    };
};

export const orderPlacedHandler: EventBridgeHandler<"OrderPlaced", OrderPlaced, void> = async (event) => {
    const order: OrderProjection = {
        orderId: event.detail.aggregateId,
        orderStatus: OrderStatusProjection.Placed,
        lineItems: event.detail.lineItems.map((x) => {
            return { sku: x.sku, quantity: x.quantity, unitPrice: x.unitPrice } as OrderLineItemProjection;
        }),
        orderTotal: round(event.detail.lineItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0)),
    };

    await ordersQueryStore.save(order);
};

export const addLineItemToOrderHandler: APIGatewayProxyHandlerV2 = async (event) => {
    if (!event.pathParameters?.orderId || !event.body) {
        return {
            statusCode: 400,
        };
    }

    const orderId = event.pathParameters.orderId;
    const command = JSON.parse(event.body) as AddLineItemToOrder;

    const order = await ordersRepository.getById(orderId);
    order.addLineItem(new OrderLineItem(command.sku, command.quantity, command.unitPrice));
    await ordersRepository.save(order);

    return {
        statusCode: 200,
    };
};

export const lineItemAddedToOrderHandler: EventBridgeHandler<"LineItemAddedToOrder", LineItemAddedToOrder, void> = async (event) => {
    const order = await ordersQueryStore.get(event.detail.aggregateId);

    order.lineItems.push({
        sku: event.detail.lineItem.sku,
        quantity: event.detail.lineItem.quantity,
        unitPrice: event.detail.lineItem.unitPrice,
    } as OrderLineItem);

    order.orderTotal += round(event.detail.lineItem.unitPrice * event.detail.lineItem.quantity);

    await ordersQueryStore.save(order);
};

export const eventStreamHandler: DynamoDBStreamHandler = async (event) => {
    for (const record of event.Records) {
        const item = unmarshall(
            record.dynamodb?.NewImage as {
                [key: string]: AttributeValue;
            }
        );

        await publishEvent(item.type, JSON.parse(item.event));
    }
};
