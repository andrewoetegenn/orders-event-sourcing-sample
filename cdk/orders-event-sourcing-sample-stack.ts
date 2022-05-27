import { aws_dynamodb, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Runtime, Tracing } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as path from "path";

export class OrdersEventSourcingSampleStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const ordersTable = new aws_dynamodb.Table(this, "OrdersTable", {
            tableName: "Orders",
            partitionKey: {
                name: "_id",
                type: aws_dynamodb.AttributeType.STRING,
            },
            removalPolicy: RemovalPolicy.DESTROY,
        });

        const placeOrderHandler = new NodejsFunction(this, "PlaceOrderHandler", {
            runtime: Runtime.NODEJS_14_X,
            handler: "handler",
            entry: path.join(__dirname, "../src/features/place-order/handler.ts"),
            tracing: Tracing.ACTIVE,
        });

        ordersTable.grantReadWriteData(placeOrderHandler);
    }
}
