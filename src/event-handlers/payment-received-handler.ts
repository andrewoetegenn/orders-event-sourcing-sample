import { ordersRepository } from "../persistance";
import { Handler } from "aws-lambda";
import { PaymentReceived } from "../events";

export const paymentReceivedHandler: Handler = async (event: PaymentReceived) => {
    const orderId = event.orderId;
    const order = await ordersRepository.getById(orderId);
    order.receivePayment(event.aggregateId, event.amount);
    await ordersRepository.save(order);
};
