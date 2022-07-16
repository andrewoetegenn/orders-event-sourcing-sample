import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { ordersRepository } from "../persistance";
import { withErrorHandling } from "../middleware";
import { AddLineItemToOrder } from "../commands";
import { OrderLineItem } from "../domain";

const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
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

export const addLineItemToOrderHandler: (event: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2> = withErrorHandling(handler);
