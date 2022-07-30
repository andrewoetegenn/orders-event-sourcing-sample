import { ordersQueryStore } from "../persistance";
import { EventBridgeHandler } from "aws-lambda";
import { OrderStatus } from "../projections";
import { OrderDispatched } from "../events";

export const orderDispatchedHandler: EventBridgeHandler<"orderDispatched", OrderDispatched, void> = async (event) => {
    const order = await ordersQueryStore.get(event.detail.aggregateId);
    order.shipments.push({ shipmentId: event.detail.shipmentId, carrier: event.detail.carrier, carrierService: event.detail.carrierService });
    order.orderStatus = OrderStatus.Dispatched;

    await ordersQueryStore.save(order);
};
