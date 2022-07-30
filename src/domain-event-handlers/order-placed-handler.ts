import { OrderDetail, OrderStatus } from "../projections";
import { ordersQueryStore } from "../persistance";
import { EventBridgeHandler } from "aws-lambda";
import { OrderPlaced } from "../events";

export const orderPlacedHandler: EventBridgeHandler<"orderPlaced", OrderPlaced, void> = async (event) => {
    const lineItems = event.detail.lineItems.map((x) => {
        return { sku: x.sku, quantity: x.quantity, unitPrice: x.unitPrice };
    });

    const order: OrderDetail = {
        orderId: event.detail.aggregateId,
        orderStatus: OrderStatus.Placed,
        lineItems,
        orderTotal: event.detail.orderTotal,
    };

    await ordersQueryStore.save(order);
};
