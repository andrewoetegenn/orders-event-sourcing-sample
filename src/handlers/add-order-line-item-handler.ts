import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { OrderLineItem } from "../domain/order";
import { ordersRepository } from "../persistance/repositories";
import { AddOrderLineItemCommand } from "../commands/add-order-line-item-command";

export const addOrderLineItemHandler: APIGatewayProxyHandlerV2 = async (event) => {
    if (!event.pathParameters?.orderId || !event.body) {
        return {
            statusCode: 400,
        };
    }

    const orderId = event.pathParameters.orderId;
    const command = JSON.parse(event.body) as AddOrderLineItemCommand;

    const order = await ordersRepository.getById(orderId);
    order.addLineItem(new OrderLineItem(command.sku, command.quantity, command.unitPrice));
    await ordersRepository.save(order);

    return {
        statusCode: 200,
    };
};
