import { ordersRepository } from "../persistance";
import { Handler } from "aws-lambda";
import { PaymentReceived } from "../events";

export const paymentReceivedHandler: Handler = async (event) => {
    const paymentReceived = JSON.parse(event) as PaymentReceived;

    const orderId = paymentReceived.orderId;
    const order = await ordersRepository.getById(orderId);
    order.receivePayment(paymentReceived.aggregateId, paymentReceived.amount);
    await ordersRepository.save(order);
};
