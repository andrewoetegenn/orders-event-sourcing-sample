import { ordersRepository } from "../persistance";
import { EventBridgeHandler } from "aws-lambda";
import { ShipmentDispatched } from "../events";

export const shipmentDispatchedHandler: EventBridgeHandler<"shipmentDispatched", ShipmentDispatched, void> = async (event) => {
    const order = await ordersRepository.getById(event.detail.orderId);
    order.dispatch(event.detail.aggregateId, event.detail.carrier, event.detail.carrierService);
    await ordersRepository.save(order);
};
