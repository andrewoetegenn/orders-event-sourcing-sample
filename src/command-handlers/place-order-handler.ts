import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { withHttpErrorHandling } from "../middleware";
import { ordersRepository } from "../persistance";
import { Order, OrderLineItem } from "../domain";
import { PlaceOrder } from "../commands";

const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
    if (!event.body) {
        return {
            statusCode: 400,
        };
    }

    const command = JSON.parse(event.body) as PlaceOrder;
    const order = Order.place(command.lineItems.map((x) => new OrderLineItem(x.sku, x.quantity, x.unitPrice)));
    await ordersRepository.save(order);

    return {
        statusCode: 201,
        body: JSON.stringify({
            orderId: order.getAggregateId(),
        }),
    };
};

export const placeOrderHandler: (event: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2> = withHttpErrorHandling(handler);
