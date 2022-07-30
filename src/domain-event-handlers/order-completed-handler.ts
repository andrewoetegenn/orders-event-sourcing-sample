import { ordersQueryStore } from "../persistance";
import { EventBridgeHandler } from "aws-lambda";
import { OrderStatus } from "../projections";
import { OrderCompleted } from "../events";

export const orderCompletedHandler: EventBridgeHandler<"orderCompleted", OrderCompleted, void> = async (event) => {
    const order = await ordersQueryStore.get(event.detail.aggregateId);
    order.orderStatus = OrderStatus.Completed;

    await ordersQueryStore.save(order);
};
