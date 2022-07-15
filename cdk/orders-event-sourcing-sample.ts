import { OrdersEventSourcingSampleStack } from "./orders-event-sourcing-sample-stack";
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";

const app = new cdk.App();

new OrdersEventSourcingSampleStack(app, "OrdersEventSourcingSampleStack", {
    env: { account: "652801582837", region: "eu-west-1" },
});
