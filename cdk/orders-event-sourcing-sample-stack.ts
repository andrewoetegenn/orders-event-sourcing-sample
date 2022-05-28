import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { AttributeType, StreamViewType, Table } from "aws-cdk-lib/aws-dynamodb";
import { EventBus } from "aws-cdk-lib/aws-events";
import { Runtime, StartingPosition, Tracing } from "aws-cdk-lib/aws-lambda";
import { DynamoEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as path from "path";

export class OrdersEventSourcingSampleStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const ordersTable = new Table(this, "OrdersTable", {
            partitionKey: {
                name: "id",
                type: AttributeType.STRING,
            },
            sortKey: {
                name: "version",
                type: AttributeType.NUMBER,
            },
            removalPolicy: RemovalPolicy.DESTROY,
            stream: StreamViewType.NEW_IMAGE,
        });

        const ordersEventBus = new EventBus(this, "OrdersEvents");

        const placeOrderHandler = new NodejsFunction(this, "PlaceOrderHandler", {
            runtime: Runtime.NODEJS_14_X,
            handler: "handler",
            entry: path.join(__dirname, "../src/handlers/place-order-handler.ts"),
            tracing: Tracing.ACTIVE,
            environment: {
                TABLE_NAME: ordersTable.tableName,
            },
        });

        ordersTable.grantReadWriteData(placeOrderHandler);

        const ordersApi = new RestApi(this, "OrdersApi");

        const root = ordersApi.root.addResource("orders");
        root.addMethod("POST", new LambdaIntegration(placeOrderHandler));

        const eventStreamHandler = new NodejsFunction(this, "EventStreamHandler", {
            runtime: Runtime.NODEJS_14_X,
            handler: "handler",
            entry: path.join(__dirname, "../src/handlers/event-stream-handler.ts"),
            tracing: Tracing.ACTIVE,
            environment: {
                EVENT_BUS_NAME: ordersEventBus.eventBusName,
            },
        });

        eventStreamHandler.addEventSource(
            new DynamoEventSource(ordersTable, { startingPosition: StartingPosition.TRIM_HORIZON })
        );

        ordersEventBus.grantPutEventsTo(eventStreamHandler);
    }
}
