import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { Order } from "../../order";
import { ordersRepository } from "../../orders-repository";
import { PlaceOrderCommand } from "./place-order-command";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    if (!event.body) {
        return {
            statusCode: 400,
        };
    }

    const command = JSON.parse(event.body) as PlaceOrderCommand;
    const order = Order.place(command.orderId);
    await ordersRepository.save(order);

    return {
        statusCode: 201,
    };
};
