import { FunctionUrlAuthType, Runtime, StartingPosition, Tracing } from "aws-cdk-lib/aws-lambda";
import { AttributeType, StreamViewType, Table } from "aws-cdk-lib/aws-dynamodb";
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

        const eventStore = this.configureEventStore();
        const queryStore = this.configureQueryStore();
        const eventBus = this.configureEventBus();
        const api = this.configureApi();

        // Place Order
        const placeOrderHandler = this.configureHttpLambda(
            "PlaceOrderHandler",
            "placeOrderHandler",
            { api, path: "/orders", method: "POST" },
            {
                EVENT_STORE_NAME: eventStore.tableName,
            }
        );

        eventStore.grantReadWriteData(placeOrderHandler);

        // Order Placed
        const orderPlacedHandler = this.configureEventLambda(
            "OrderPlacedHandler",
            "orderPlacedHandler",
            { bus: eventBus, id: "OrderPlacedRule", source: "orders", detailType: ["orderPlaced"] },
            {
                QUERY_STORE_NAME: queryStore.tableName,
            }
        );

        queryStore.grantReadWriteData(orderPlacedHandler);

        // Get Order
        const getOrderHandler = this.configureHttpLambda(
            "GetOrderHandler",
            "getOrderHandler",
            { api, path: "/orders/{orderId}", method: "GET" },
            {
                QUERY_STORE_NAME: queryStore.tableName,
            }
        );

        queryStore.grantReadData(getOrderHandler);

        // Add Line Item To Order
        const addLineItemToOrderHandler = this.configureHttpLambda(
            "AddLineItemToOrderHandler",
            "addLineItemToOrderHandler",
            { api, path: "/orders/{orderId}/items", method: "POST" },
            {
                EVENT_STORE_NAME: eventStore.tableName,
            }
        );

        eventStore.grantReadWriteData(addLineItemToOrderHandler);

        // Line Item Added To Order
        const lineItemAddedToOrderHandler = this.configureEventLambda(
            "LineItemAddedToOrderHandler",
            "lineItemAddedToOrderHandler",
            { bus: eventBus, id: "LineItemAddedToOrderRule", source: "orders", detailType: ["lineItemAddedToOrder"] },
            {
                QUERY_STORE_NAME: queryStore.tableName,
            }
        );

        queryStore.grantReadWriteData(lineItemAddedToOrderHandler);

        // Approve Order
        const approveOrderHandler = this.configureHttpLambda(
            "ApproveOrderHandler",
            "approveOrderHandler",
            { api, path: "/orders/{orderId}/approve", method: "POST" },
            {
                EVENT_STORE_NAME: eventStore.tableName,
            }
        );

        eventStore.grantReadWriteData(approveOrderHandler);

        // Order Approved
        const orderApprovedHandler = this.configureEventLambda(
            "OrderApprovedHandler",
            "orderApprovedHandler",
            { bus: eventBus, id: "OrderApprovedRule", source: "orders", detailType: ["orderApproved"] },
            {
                QUERY_STORE_NAME: queryStore.tableName,
            }
        );

        queryStore.grantReadWriteData(orderApprovedHandler);

        // Payment Received
        const paymentReceivedLambda = this.configureEventLambda(
            "PaymentReceivedHandler",
            "paymentReceivedHandler",
            { bus: eventBus, id: "PaymentReceivedRule", source: "payments", detailType: ["paymentReceived"] },
            {
                EVENT_STORE_NAME: eventStore.tableName,
            }
        );

        eventStore.grantReadWriteData(paymentReceivedLambda);

        // Event Stream
        const eventStreamHandler = this.configureLambda("EventStreamHandler", "eventStreamHandler", {
            EVENT_BUS_NAME: eventBus.eventBusName,
        });

        eventStreamHandler.addEventSource(new DynamoEventSource(eventStore, { startingPosition: StartingPosition.TRIM_HORIZON, retryAttempts: 2 }));

        eventBus.grantPutEventsTo(eventStreamHandler);
    }

    configureEventStore = (): Table => {
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

        return eventStore;
    };

    configureQueryStore = (): Table => {
        const queryStore = new Table(this, "OrdersQueryStore", {
            partitionKey: {
                name: "orderId",
                type: AttributeType.STRING,
            },
            removalPolicy: RemovalPolicy.DESTROY,
        });

        return queryStore;
    };

    configureEventBus = (): EventBus => {
        const eventBus = new EventBus(this, "OrdersEvents");
        return eventBus;
    };

    configureApi = (): RestApi => {
        const api = new RestApi(this, "OrdersApi");
        return api;
    };

    configureLambda = (
        id: string,
        handler: string,
        environment?: {
            [key: string]: string;
        }
    ): NodejsFunction => {
        const lambda = new NodejsFunction(this, id, {
            runtime: Runtime.NODEJS_14_X,
            handler: handler,
            entry: path.join(__dirname, "../src/handlers.ts"),
            tracing: Tracing.ACTIVE,
            environment: environment,
        });

        return lambda;
    };

    configureHttpLambda = (
        id: string,
        handler: string,
        httpOptions: {
            api: RestApi;
            path: string;
            method: string;
        },
        environment?: {
            [key: string]: string;
        }
    ) => {
        const lambda = this.configureLambda(id, handler, environment);
        httpOptions.api.root.resourceForPath(httpOptions.path).addMethod(httpOptions.method, new LambdaIntegration(lambda));
        return lambda;
    };

    configureEventLambda = (
        id: string,
        handler: string,
        eventRuleOptions: {
            bus: EventBus;
            id: string;
            source: string;
            detailType: string[];
        },
        environment?: {
            [key: string]: string;
        }
    ) => {
        const lambda = this.configureLambda(id, handler, environment);

        new Rule(this, eventRuleOptions.id, {
            eventBus: eventRuleOptions.bus,
            eventPattern: {
                source: [eventRuleOptions.source],
                detailType: eventRuleOptions.detailType,
            },
            targets: [new LambdaFunction(lambda)],
        });

        return lambda;
    };
}
