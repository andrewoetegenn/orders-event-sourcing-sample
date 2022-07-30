import { ordersRepository } from "../persistance";
import { EventBridgeHandler } from "aws-lambda";
import { ShipmentDelivered } from "../events";

export const shipmentDeliveredHandler: EventBridgeHandler<"shipmentDelivered", ShipmentDelivered, void> = async (event) => {
    const order = await ordersRepository.getById(event.detail.orderId);
    order.deliver(event.detail.aggregateId);
    await ordersRepository.save(order);
};
