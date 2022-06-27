import { EventBridgeHandler } from "aws-lambda";
import { OrderPlacedEvent } from "../events/order-placed-event";
import { Order, OrderLineItem, OrderStatus } from "../projections/order";
import { ordersQueryStore } from "../persistance/query-store";

export const orderPlacedHandler: EventBridgeHandler<"OrderPlaced", OrderPlacedEvent, void> = async (event) => {
    const order: Order = {
        orderId: event.detail.aggregateId,
        orderStatus: OrderStatus.Placed,
        lineItems: event.detail.lineItems.map((x) => {
            return { sku: x.sku, quantity: x.quantity, unitPrice: x.unitPrice } as OrderLineItem;
        }),
        orderTotal: event.detail.orderTotal,
    };

    await ordersQueryStore.save(order);
};
