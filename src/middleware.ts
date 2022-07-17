import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { InvalidOrderStatusError, OrderNotFoundError } from "./errors";

export const withHttpErrorHandling =
    (handler: (event: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2>) =>
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
        try {
            return await handler(event);
        } catch (err) {
            const error = err as Error;

            switch (error.constructor) {
                case InvalidOrderStatusError:
                    return buildErrorResponse(error, 400);
                case OrderNotFoundError:
                    return buildErrorResponse(error, 404);
                default:
                    return { statusCode: 500 };
            }
        }
    };

const buildErrorResponse = (error: Error, statusCode: number) => {
    return {
        statusCode,
        body: JSON.stringify({ type: error.name, message: error.message }),
    };
};
