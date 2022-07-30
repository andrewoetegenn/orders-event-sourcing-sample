import { ordersQueryStore } from "../persistance";
import { EventBridgeHandler } from "aws-lambda";
import { OrderStatus } from "../projections";
import { OrderDelivered } from "../events";

export const orderDeliveredHandler: EventBridgeHandler<"orderDelivered", OrderDelivered, void> = async (event) => {
    const order = await ordersQueryStore.get(event.detail.aggregateId);
    order.orderStatus = OrderStatus.Delivered;

    await ordersQueryStore.save(order);
};
