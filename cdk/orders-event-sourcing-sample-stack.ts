import { AttributeType, StreamViewType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Runtime, StartingPosition, Tracing } from "aws-cdk-lib/aws-lambda";
import { DynamoEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { EventBus, Rule } from "aws-cdk-lib/aws-events";
import { Construct } from "constructs";
import * as path from "path";

export class OrdersEventSourcingSampleStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const eventStore = new Table(this, "OrdersEventStore", {
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

        const queryStore = new Table(this, "OrdersQueryStore", {
            partitionKey: {
                name: "orderId",
                type: AttributeType.STRING,
            },
            removalPolicy: RemovalPolicy.DESTROY,
        });

        const eventBus = new EventBus(this, "OrdersEvents");

        const api = new RestApi(this, "OrdersApi");

        // Place Order
        const placeOrderHandler = new NodejsFunction(this, "PlaceOrderHandler", {
            runtime: Runtime.NODEJS_14_X,
            handler: "placeOrderHandler",
            entry: path.join(__dirname, "../src/handlers/place-order-handler.ts"),
            tracing: Tracing.ACTIVE,
            environment: {
                EVENT_STORE_NAME: eventStore.tableName,
            },
        });

        eventStore.grantReadWriteData(placeOrderHandler);

        api.root.resourceForPath("/orders").addMethod("POST", new LambdaIntegration(placeOrderHandler));

        // Order Placed
        const orderPlacedHandler = new NodejsFunction(this, "OrderPlacedHandler", {
            runtime: Runtime.NODEJS_14_X,
            handler: "orderPlacedHandler",
            entry: path.join(__dirname, "../src/handlers/order-placed-handler.ts"),
            tracing: Tracing.ACTIVE,
            environment: {
                QUERY_STORE_NAME: queryStore.tableName,
            },
        });

        queryStore.grantReadWriteData(orderPlacedHandler);

        new Rule(this, "OrderPlacedRule", {
            eventBus: eventBus,
            eventPattern: {
                source: ["Orders"],
                detailType: ["OrderPlaced"],
            },
            targets: [new LambdaFunction(orderPlacedHandler)],
        });

        // Get Order
        const getOrderHandler = new NodejsFunction(this, "GetOrderHandler", {
            runtime: Runtime.NODEJS_14_X,
            handler: "getOrderHandler",
            entry: path.join(__dirname, "../src/handlers/get-order-handler.ts"),
            tracing: Tracing.ACTIVE,
            environment: {
                QUERY_STORE_NAME: queryStore.tableName,
            },
        });

        queryStore.grantReadData(getOrderHandler);

        api.root.resourceForPath("/orders/{orderId}").addMethod("GET", new LambdaIntegration(getOrderHandler));

        // Add Line Item To Order
        const addOrderLineItemHandler = new NodejsFunction(this, "AddLineItemToOrderHandler", {
            runtime: Runtime.NODEJS_14_X,
            handler: "addLineItemToOrderHandler",
            entry: path.join(__dirname, "../src/handlers/add-line-item-to-order-handler.ts"),
            tracing: Tracing.ACTIVE,
            environment: {
                EVENT_STORE_NAME: eventStore.tableName,
            },
        });

        eventStore.grantReadWriteData(addOrderLineItemHandler);

        api.root.resourceForPath("/orders/{orderId}/items").addMethod("POST", new LambdaIntegration(addOrderLineItemHandler));

        // Line Item Added To Order
        const orderLineItemAddedHandler = new NodejsFunction(this, "LineItemAddedToOrderHandler", {
            runtime: Runtime.NODEJS_14_X,
            handler: "lineItemAddedToOrderHandler",
            entry: path.join(__dirname, "../src/handlers/line-item-added-to-order-handler.ts"),
            tracing: Tracing.ACTIVE,
            environment: {
                QUERY_STORE_NAME: queryStore.tableName,
            },
        });

        queryStore.grantReadWriteData(orderLineItemAddedHandler);

        new Rule(this, "LineItemAddedToOrderRule", {
            eventBus: eventBus,
            eventPattern: {
                source: ["Orders"],
                detailType: ["LineItemAddedToOrder"],
            },
            targets: [new LambdaFunction(orderLineItemAddedHandler)],
        });

        // Approve Order
        const approveOrderHandler = new NodejsFunction(this, "ApproveOrderHandler", {
            runtime: Runtime.NODEJS_14_X,
            handler: "approveOrderHandler",
            entry: path.join(__dirname, "../src/handlers/approve-order-handler.ts"),
            tracing: Tracing.ACTIVE,
            environment: {
                EVENT_STORE_NAME: eventStore.tableName,
            },
        });

        eventStore.grantReadWriteData(approveOrderHandler);

        api.root.resourceForPath("/orders/{orderId}/approve").addMethod("POST", new LambdaIntegration(approveOrderHandler));

        // Order Approved
        const orderApprovedHandler = new NodejsFunction(this, "OrderApprovedHandler", {
            runtime: Runtime.NODEJS_14_X,
            handler: "orderApprovedHandler",
            entry: path.join(__dirname, "../src/handlers/order-approved-handler.ts"),
            tracing: Tracing.ACTIVE,
            environment: {
                QUERY_STORE_NAME: queryStore.tableName,
            },
        });

        queryStore.grantReadWriteData(orderApprovedHandler);

        new Rule(this, "OrderApprovedRule", {
            eventBus: eventBus,
            eventPattern: {
                source: ["Orders"],
                detailType: ["OrderApproved"],
            },
            targets: [new LambdaFunction(orderApprovedHandler)],
        });

        // Event Stream
        const eventStreamHandler = new NodejsFunction(this, "EventStreamHandler", {
            runtime: Runtime.NODEJS_14_X,
            handler: "eventStreamHandler",
            entry: path.join(__dirname, "../src/handlers/event-stream-handler.ts"),
            tracing: Tracing.ACTIVE,
            environment: {
                EVENT_BUS_NAME: eventBus.eventBusName,
            },
        });

        eventStreamHandler.addEventSource(new DynamoEventSource(eventStore, { startingPosition: StartingPosition.TRIM_HORIZON, retryAttempts: 2 }));

        eventBus.grantPutEventsTo(eventStreamHandler);
    }
}
