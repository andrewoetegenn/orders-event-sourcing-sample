import { ordersQueryStore } from "../persistance";
import { EventBridgeHandler } from "aws-lambda";
import { OrderStatus } from "../projections";
import { OrderApproved } from "../events";

export const orderApprovedHandler: EventBridgeHandler<"OrderApproved", OrderApproved, void> = async (event) => {
    const order = await ordersQueryStore.get(event.detail.aggregateId);
    order.orderStatus = OrderStatus.Approved;

    await ordersQueryStore.save(order);
};
