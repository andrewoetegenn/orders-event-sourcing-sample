import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { ordersQueryStore } from "../persistance";

export const getOrderHandler: APIGatewayProxyHandlerV2 = async (event) => {
    if (!event.pathParameters?.orderId) {
        return {
            statusCode: 400,
        };
    }

    const orderId = event.pathParameters.orderId;
    const order = await ordersQueryStore.get(orderId);

    if (!order) {
        return {
            statusCode: 404,
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify(order),
    };
};
