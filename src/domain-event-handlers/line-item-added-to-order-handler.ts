import { ordersQueryStore } from "../persistance";
import { LineItemAddedToOrder } from "../events";
import { EventBridgeHandler } from "aws-lambda";

export const lineItemAddedToOrderHandler: EventBridgeHandler<"lineItemAddedToOrder", LineItemAddedToOrder, void> = async (event) => {
    const order = await ordersQueryStore.get(event.detail.aggregateId);

    const lineItemIndex = order.lineItems.findIndex((item) => item.sku === event.detail.lineItem.sku);

    if (lineItemIndex !== -1) {
        order.lineItems[lineItemIndex].quantity += event.detail.lineItem.quantity;
    } else {
        order.lineItems.push({
            sku: event.detail.lineItem.sku,
            quantity: event.detail.lineItem.quantity,
            unitPrice: event.detail.lineItem.unitPrice,
        });
    }

    order.orderTotal = event.detail.orderTotal;

    await ordersQueryStore.save(order);
};
