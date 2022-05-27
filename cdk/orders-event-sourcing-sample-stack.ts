import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Runtime, Tracing } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as path from "path";

export class OrdersEventSourcingSampleStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const ordersTable = new Table(this, "OrdersTable", {
            tableName: "Orders",
            partitionKey: {
                name: "id",
                type: AttributeType.STRING,
            },
            sortKey: {
                name: "version",
                type: AttributeType.NUMBER,
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

        const ordersApi = new RestApi(this, "OrdersApi");

        const root = ordersApi.root.addResource("orders");
        root.addMethod("POST", new LambdaIntegration(placeOrderHandler));
    }
}
