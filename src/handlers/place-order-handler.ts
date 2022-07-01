import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { Order, OrderLineItem } from "../domain/order";
import { ordersRepository } from "../persistance/repositories";
import { PlaceOrderCommand } from "../commands/place-order-command";

export const placeOrderHandler: APIGatewayProxyHandlerV2 = async (event) => {
    if (!event.body) {
        return {
            statusCode: 400,
        };
    }

    const command = JSON.parse(event.body) as PlaceOrderCommand;
    const order = Order.place(command.lineItems.map((x) => new OrderLineItem(x.sku, x.quantity, x.unitPrice)));
    await ordersRepository.save(order);

    return {
        statusCode: 201,
        body: JSON.stringify({
            orderId: order.getAggregateId(),
        }),
    };
};