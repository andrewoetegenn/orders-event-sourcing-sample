import { aws_dynamodb, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

export class OrdersEventSourcingSampleStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const table = new aws_dynamodb.Table(this, "OrdersTable", {
            tableName: "Orders",
            partitionKey: {
                name: "orderId",
                type: aws_dynamodb.AttributeType.STRING,
            },
        });
    }
}
