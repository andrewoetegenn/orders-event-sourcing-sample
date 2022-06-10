import { EventBridgeHandler } from "aws-lambda";
import { OrderLineItemAdded } from ".";
import { OrderLineItem } from "../../projections";
import { ordersQueryStore } from "../../query-store";

export const orderLineItemAddedHandler: EventBridgeHandler<"OrderLineItemAdded", OrderLineItemAdded, void> = async (
    event
) => {
    const order = await ordersQueryStore.get(event.detail.id);

    order.lineItems.push({
        sku: event.detail.lineItem.sku,
        quantity: event.detail.lineItem.quantity,
        unitPrice: event.detail.lineItem.unitPrice,
    } as OrderLineItem);

    await ordersQueryStore.save(order);
};
