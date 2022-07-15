import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { ordersRepository } from "../persistance";
import { AddLineItemToOrder } from "../commands";
import { OrderLineItem } from "../domain";

export const addLineItemToOrderHandler: APIGatewayProxyHandlerV2 = async (event) => {
    if (!event.pathParameters?.orderId || !event.body) {
        return {
            statusCode: 400,
        };
    }

    const orderId = event.pathParameters.orderId;
    const command = JSON.parse(event.body) as AddLineItemToOrder;

    const order = await ordersRepository.getById(orderId);
    order.addLineItem(new OrderLineItem(command.sku, command.quantity, command.unitPrice));
    await ordersRepository.save(order);

    return {
        statusCode: 200,
    };
};
