import { EventBridgeHandler } from "aws-lambda";
import { OrderLineItemAddedEvent } from "../events/order-line-item-added-event";
import { OrderLineItem } from "../projections/order";
import { ordersQueryStore } from "../persistance/query-store";

export const orderLineItemAddedHandler: EventBridgeHandler<
    "OrderLineItemAddedEvent",
    OrderLineItemAddedEvent,
    void
> = async (event) => {
    const order = await ordersQueryStore.get(event.detail.aggregateId);

    order.lineItems.push({
        sku: event.detail.lineItem.sku,
        quantity: event.detail.lineItem.quantity,
        unitPrice: event.detail.lineItem.unitPrice,
    } as OrderLineItem);

    order.orderTotal = event.detail.orderTotal;

    await ordersQueryStore.save(order);
};
