import { calculateOrderTotal, Order, OrderLineItem, OrderStatus } from "../projections";
import { ordersQueryStore } from "../persistance";
import { EventBridgeHandler } from "aws-lambda";
import { OrderPlaced } from "../events";

export const orderPlacedHandler: EventBridgeHandler<"OrderPlaced", OrderPlaced, void> = async (event) => {
    const lineItems = event.detail.lineItems.map((x) => {
        return { sku: x.sku, quantity: x.quantity, unitPrice: x.unitPrice } as OrderLineItem;
    });

    const order: Order = {
        orderId: event.detail.aggregateId,
        orderStatus: OrderStatus.Placed,
        lineItems,
        orderTotal: calculateOrderTotal(lineItems),
    };

    await ordersQueryStore.save(order);
};
