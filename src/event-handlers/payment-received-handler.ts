import { ordersRepository } from "../persistance";
import { EventBridgeHandler } from "aws-lambda";
import { PaymentReceived } from "../events";

export const paymentReceivedHandler: EventBridgeHandler<"paymentReceived", PaymentReceived, void> = async (event) => {
    const orderId = event.detail.orderId;
    const order = await ordersRepository.getById(orderId);
    order.receivePayment(event.detail.aggregateId, event.detail.amount);
    await ordersRepository.save(order);
};
