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
    private eventStore: Table;
    private queryStore: Table;
    private eventBus: EventBus;
    private api: RestApi;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        this.configureEventStore();
        this.configureQueryStore();
        this.configureEventBus();
        this.configureApi();

        this.configureCommandHandlers();
        this.configureDomainEventHandlers();
        this.configureIntegrationEventHandlers();
        this.configureQueryHandlers();

        // Event Stream
        const eventStreamHandler = this.configureLambda("EventStreamHandler", "eventStreamHandler", {
            EVENT_BUS_NAME: this.eventBus.eventBusName,
        });

        eventStreamHandler.addEventSource(new DynamoEventSource(this.eventStore, { startingPosition: StartingPosition.TRIM_HORIZON, retryAttempts: 2 }));

        this.eventBus.grantPutEventsTo(eventStreamHandler);
    }

    configureEventStore = (): void => {
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

        this.eventStore = eventStore;
    };

    configureQueryStore = (): void => {
        const queryStore = new Table(this, "OrdersQueryStore", {
            partitionKey: {
                name: "orderId",
                type: AttributeType.STRING,
            },
            removalPolicy: RemovalPolicy.DESTROY,
        });

        this.queryStore = queryStore;
    };

    configureEventBus = (): void => {
        const eventBus = new EventBus(this, "OrdersEvents");
        this.eventBus = eventBus;
    };

    configureApi = (): void => {
        const api = new RestApi(this, "OrdersEventSourcingSampleApi", {
            restApiName: "orders-event-sourcing-sample-api",
        });
        this.api = api;
    };

    configureCommandHandlers = (): void => {
        // Place Order
        const placeOrderHandler = this.configureHttpLambda(
            "PlaceOrderHandler",
            "placeOrderHandler",
            { api: this.api, path: "/orders", method: "POST" },
            {
                EVENT_STORE_NAME: this.eventStore.tableName,
            }
        );

        this.eventStore.grantReadWriteData(placeOrderHandler);

        // Add Line Item To Order
        const addLineItemToOrderHandler = this.configureHttpLambda(
            "AddLineItemToOrderHandler",
            "addLineItemToOrderHandler",
            { api: this.api, path: "/orders/{orderId}/items", method: "POST" },
            {
                EVENT_STORE_NAME: this.eventStore.tableName,
            }
        );

        this.eventStore.grantReadWriteData(addLineItemToOrderHandler);

        // Approve Order
        const approveOrderHandler = this.configureHttpLambda(
            "ApproveOrderHandler",
            "approveOrderHandler",
            { api: this.api, path: "/orders/{orderId}/approve", method: "POST" },
            {
                EVENT_STORE_NAME: this.eventStore.tableName,
            }
        );

        this.eventStore.grantReadWriteData(approveOrderHandler);
    };

    configureDomainEventHandlers = (): void => {
        // Order Placed
        const orderPlacedHandler = this.configureEventLambda(
            "OrderPlacedHandler",
            "orderPlacedHandler",
            { bus: this.eventBus, id: "OrderPlacedRule", source: "orders", detailType: ["orderPlaced"] },
            {
                QUERY_STORE_NAME: this.queryStore.tableName,
            }
        );

        this.queryStore.grantReadWriteData(orderPlacedHandler);

        // Line Item Added To Order
        const lineItemAddedToOrderHandler = this.configureEventLambda(
            "LineItemAddedToOrderHandler",
            "lineItemAddedToOrderHandler",
            { bus: this.eventBus, id: "LineItemAddedToOrderRule", source: "orders", detailType: ["lineItemAddedToOrder"] },
            {
                QUERY_STORE_NAME: this.queryStore.tableName,
            }
        );

        this.queryStore.grantReadWriteData(lineItemAddedToOrderHandler);

        // Order Approved
        const orderApprovedHandler = this.configureEventLambda(
            "OrderApprovedHandler",
            "orderApprovedHandler",
            { bus: this.eventBus, id: "OrderApprovedRule", source: "orders", detailType: ["orderApproved"] },
            {
                QUERY_STORE_NAME: this.queryStore.tableName,
            }
        );

        this.queryStore.grantReadWriteData(orderApprovedHandler);

        // Order Payment Received
        const orderPaymentReceivedHandler = this.configureEventLambda(
            "OrderPaymentReceivedHandler",
            "orderPaymentReceivedHandler",
            { bus: this.eventBus, id: "OrderPaymentReceivedRule", source: "orders", detailType: ["orderPaymentReceived"] },
            {
                QUERY_STORE_NAME: this.queryStore.tableName,
            }
        );

        this.queryStore.grantReadWriteData(orderPaymentReceivedHandler);

        // Order Paid
        const orderPaidHandler = this.configureEventLambda(
            "OrderPaidHandler",
            "orderPaidHandler",
            { bus: this.eventBus, id: "OrderPaidRule", source: "orders", detailType: ["orderPaid"] },
            {
                QUERY_STORE_NAME: this.queryStore.tableName,
            }
        );

        this.queryStore.grantReadWriteData(orderPaidHandler);

        // Order Dispatched
        const orderDispatchedHandler = this.configureEventLambda(
            "OrderDispatchedHandler",
            "orderDispatchedHandler",
            { bus: this.eventBus, id: "OrderDispatchedRule", source: "orders", detailType: ["orderDispatched"] },
            {
                QUERY_STORE_NAME: this.queryStore.tableName,
            }
        );

        this.queryStore.grantReadWriteData(orderDispatchedHandler);

        // Order Delivered
        const orderDeliveredHandler = this.configureEventLambda(
            "OrderDeliveredHandler",
            "orderDeliveredHandler",
            { bus: this.eventBus, id: "OrderDeliveredRule", source: "orders", detailType: ["orderDelivered"] },
            {
                QUERY_STORE_NAME: this.queryStore.tableName,
            }
        );

        this.queryStore.grantReadWriteData(orderDeliveredHandler);

        // Order Completed
        const orderCompletedHandler = this.configureEventLambda(
            "OrderCompletedHandler",
            "orderCompletedHandler",
            { bus: this.eventBus, id: "OrderCompletedRule", source: "orders", detailType: ["orderCompleted"] },
            {
                QUERY_STORE_NAME: this.queryStore.tableName,
            }
        );

        this.queryStore.grantReadWriteData(orderCompletedHandler);
    };

    configureIntegrationEventHandlers = (): void => {
        // Payment Received
        const paymentReceivedHandler = this.configureEventLambda(
            "PaymentReceivedHandler",
            "paymentReceivedHandler",
            { bus: this.eventBus, id: "PaymentReceivedRule", source: "payments", detailType: ["paymentReceived"] },
            {
                EVENT_STORE_NAME: this.eventStore.tableName,
            }
        );

        this.eventStore.grantReadWriteData(paymentReceivedHandler);

        // Shipment Dispatched
        const shipmentDispatchedHandler = this.configureEventLambda(
            "ShipmentDispatchedHandler",
            "shipmentDispatchedHandler",
            { bus: this.eventBus, id: "ShipmentDispatchedRule", source: "shipments", detailType: ["shipmentDispatched"] },
            {
                EVENT_STORE_NAME: this.eventStore.tableName,
            }
        );

        this.eventStore.grantReadWriteData(shipmentDispatchedHandler);

        // Shipment Delivered
        const shipmentDeliveredHandler = this.configureEventLambda(
            "ShipmentDeliveredHandler",
            "shipmentDeliveredHandler",
            { bus: this.eventBus, id: "ShipmentDeliveredRule", source: "shipments", detailType: ["shipmentDelivered"] },
            {
                EVENT_STORE_NAME: this.eventStore.tableName,
            }
        );

        this.eventStore.grantReadWriteData(shipmentDeliveredHandler);
    };

    configureQueryHandlers = (): void => {
        // Get Order Detail
        const getOrderDetailHandler = this.configureHttpLambda(
            "GetOrderDetailHandler",
            "getOrderDetailHandler",
            { api: this.api, path: "/orders/{orderId}", method: "GET" },
            {
                QUERY_STORE_NAME: this.queryStore.tableName,
            }
        );

        this.queryStore.grantReadData(getOrderDetailHandler);
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
