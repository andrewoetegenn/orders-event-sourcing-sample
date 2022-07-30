import { ordersQueryStore } from "../persistance";
import { OrderPaymentReceived } from "../events";
import { EventBridgeHandler } from "aws-lambda";

export const orderPaymentReceivedHandler: EventBridgeHandler<"orderPaymentReceived", OrderPaymentReceived, void> = async (event) => {
    const order = await ordersQueryStore.get(event.detail.aggregateId);
    order.payments.push({ paymentId: event.detail.paymentId, amount: event.detail.amount });

    await ordersQueryStore.save(order);
};
