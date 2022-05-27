import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { Order } from "../../order";
import { PlaceOrderCommand } from "./place-order-command";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    if (!event.body) {
        return {
            statusCode: 400,
        };
    }

    const command = JSON.parse(event.body) as PlaceOrderCommand;
    const order = new Order(command.orderId);

    // persist through a repository??

    return {
        statusCode: 201,
    };
};
