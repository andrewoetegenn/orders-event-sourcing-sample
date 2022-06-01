import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { AttributeType, StreamViewType, Table } from "aws-cdk-lib/aws-dynamodb";
import { EventBus, Rule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { Runtime, StartingPosition, Tracing } from "aws-cdk-lib/aws-lambda";
import { DynamoEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as path from "path";

export class OrdersEventSourcingSampleStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const ordersEventStore = new Table(this, "OrdersEventStore", {
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

        const ordersQueryStore = new Table(this, "OrdersQueryStore", {
            partitionKey: {
                name: "orderId",
                type: AttributeType.STRING,
            },
            removalPolicy: RemovalPolicy.DESTROY,
        });

        const ordersEventBus = new EventBus(this, "OrdersEvents");

        const ordersApi = new RestApi(this, "OrdersApi");
        const root = ordersApi.root.addResource("orders");

        // Place Order
        const placeOrderHandler = new NodejsFunction(this, "PlaceOrderHandler", {
            runtime: Runtime.NODEJS_14_X,
            handler: "placeOrderHandler",
            entry: path.join(__dirname, "../src/features/place-order/index.ts"),
            tracing: Tracing.ACTIVE,
            environment: {
                EVENT_STORE_NAME: ordersEventStore.tableName,
            },
        });

        ordersEventStore.grantReadWriteData(placeOrderHandler);

        root.addMethod("POST", new LambdaIntegration(placeOrderHandler));

        // Order Placed
        const orderPlacedHandler = new NodejsFunction(this, "OrderPlacedHandler", {
            runtime: Runtime.NODEJS_14_X,
            handler: "orderPlacedHandler",
            entry: path.join(__dirname, "../src/features/place-order/index.ts"),
            tracing: Tracing.ACTIVE,
            environment: {
                QUERY_STORE_NAME: ordersQueryStore.tableName,
            },
        });

        ordersQueryStore.grantReadWriteData(orderPlacedHandler);

        new Rule(this, "OrderPlacedRule", {
            eventBus: ordersEventBus,
            eventPattern: {
                source: ["Orders"],
                detailType: ["OrderPlaced"],
            },
            targets: [new LambdaFunction(orderPlacedHandler)],
        });

        // Event Stream
        const eventStreamHandler = new NodejsFunction(this, "EventStreamHandler", {
            runtime: Runtime.NODEJS_14_X,
            handler: "eventStreamHandler",
            entry: path.join(__dirname, "../src/handlers.ts"),
            tracing: Tracing.ACTIVE,
            environment: {
                EVENT_BUS_NAME: ordersEventBus.eventBusName,
            },
        });

        eventStreamHandler.addEventSource(
            new DynamoEventSource(ordersEventStore, { startingPosition: StartingPosition.TRIM_HORIZON })
        );

        ordersEventBus.grantPutEventsTo(eventStreamHandler);
    }
}
