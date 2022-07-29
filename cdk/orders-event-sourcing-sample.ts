import { OrdersEventSourcingSampleStack } from "./orders-event-sourcing-sample-stack";
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";

const app = new cdk.App();

new OrdersEventSourcingSampleStack(app, "OrdersEventSourcingSampleStack", {
    stackName: "orders-sample-event-sourcing",
    description: "A fictional orders domain demonstrating CQRS and event sourcing patterns",
    env: { account: "652801582837", region: "eu-west-1" },
});
