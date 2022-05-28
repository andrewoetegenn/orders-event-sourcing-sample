import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { Order } from "../domain/order";
import { ordersRepository } from "../persistance/orders-repository";
import { PlaceOrderCommand } from "../commands/place-order-command";

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
