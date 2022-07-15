import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { ordersRepository } from "../persistance";
import { Order, OrderLineItem } from "../domain";
import { PlaceOrder } from "../commands";

export const approveOrderHandler: APIGatewayProxyHandlerV2 = async (event) => {
    if (!event.pathParameters?.orderId) {
        return {
            statusCode: 400,
        };
    }

    const orderId = event.pathParameters.orderId;
    const order = await ordersRepository.getById(orderId);

    try {
        order.approve();
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error }),
        };
    }

    await ordersRepository.save(order);

    return {
        statusCode: 200,
    };
};
