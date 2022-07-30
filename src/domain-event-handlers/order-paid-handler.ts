import { ordersQueryStore } from "../persistance";
import { EventBridgeHandler } from "aws-lambda";
import { OrderStatus } from "../projections";
import { OrderPaid } from "../events";

export const orderPaidHandler: EventBridgeHandler<"orderPaid", OrderPaid, void> = async (event) => {
    const order = await ordersQueryStore.get(event.detail.aggregateId);
    order.orderStatus = OrderStatus.Paid;

    await ordersQueryStore.save(order);
};
