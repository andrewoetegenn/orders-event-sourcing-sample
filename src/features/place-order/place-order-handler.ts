import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { Order, OrderLineItem } from "../../domain";
import { ordersRepository } from "../../repositories";
import { PlaceOrderCommand } from ".";

export const placeOrderHandler: APIGatewayProxyHandlerV2 = async (event) => {
    if (!event.body) {
        return {
            statusCode: 400,
        };
    }

    const command = JSON.parse(event.body) as PlaceOrderCommand;
    const order = new Order(command.lineItems.map((x) => new OrderLineItem(x.sku, x.quantity, x.unitPrice)));
    await ordersRepository.save(order);

    return {
        statusCode: 201,
        body: JSON.stringify({
            orderId: order.getAggregateId(),
        }),
    };
};
