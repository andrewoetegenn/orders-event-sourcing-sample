import { EventBridgeHandler } from "aws-lambda";
import { OrderPlaced } from ".";
import { Order, OrderLineItem, OrderStatus } from "../../projections";
import { ordersQueryStore } from "../../query-store";

export const orderPlacedHandler: EventBridgeHandler<"OrderPlaced", OrderPlaced, void> = async (event) => {
    const order: Order = {
        orderId: event.detail.id,
        orderStatus: OrderStatus.Placed,
        lineItems: event.detail.lineItems.map((x) => {
            return { sku: x.sku, quantity: x.quantity, unitPrice: x.unitPrice } as OrderLineItem;
        }),
    };

    await ordersQueryStore.save(order);
};
