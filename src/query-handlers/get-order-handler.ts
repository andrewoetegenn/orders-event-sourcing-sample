import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { withHttpErrorHandling } from "../middleware";
import { ordersQueryStore } from "../persistance";

const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
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

export const getOrderHandler: (event: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2> = withHttpErrorHandling(handler);
