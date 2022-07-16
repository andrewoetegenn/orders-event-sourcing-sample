import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { DomainError, DomainErrorName } from "./domain";

const domainErrors: Record<DomainErrorName, number> = {
    InvalidOrderStatus: 400,
};

export const withHttpErrorHandling =
    (handler: (event: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2>) =>
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
        try {
            return await handler(event);
        } catch (error) {
            if (error instanceof DomainError) {
                const domainError = error as DomainError;

                return {
                    statusCode: domainErrors[domainError.name],
                    body: JSON.stringify({ type: domainError.name, message: domainError.message }),
                };
            }

            return {
                statusCode: 500,
            };
        }
    };
