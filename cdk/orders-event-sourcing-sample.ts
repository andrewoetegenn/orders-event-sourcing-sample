import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { OrdersEventSourcingSampleStack } from "./orders-event-sourcing-sample-stack";

const app = new cdk.App();

new OrdersEventSourcingSampleStack(app, "OrdersEventSourcingSampleStack", {
    env: { account: "652801582837", region: "eu-west-1" },
});
