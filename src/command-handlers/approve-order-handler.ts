import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { withHttpErrorHandling } from "../middleware";
import { ordersRepository } from "../persistance";

const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
    if (!event.pathParameters?.orderId) {
        return {
            statusCode: 400,
        };
    }

    const orderId = event.pathParameters.orderId;
    const order = await ordersRepository.getById(orderId);
    order.approve();
    await ordersRepository.save(order);

    return {
        statusCode: 200,
    };
};

export const approveOrderHandler: (event: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2> = withHttpErrorHandling(handler);
