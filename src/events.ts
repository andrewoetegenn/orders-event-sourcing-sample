import { OrderLineItem } from "./domain";

export interface IEvent {
    readonly aggregateId: string;
    readonly type: string;
}

// Domain Events
export class OrderPlaced implements IEvent {
    public readonly type: string = "orderPlaced";
    constructor(public readonly aggregateId: string, public readonly lineItems: OrderLineItem[], public readonly orderTotal: number) {}
}

export class LineItemAddedToOrder implements IEvent {
    public readonly type: string = "lineItemAddedToOrder";
    constructor(public readonly aggregateId: string, public readonly lineItem: OrderLineItem, public readonly orderTotal: number) {}
}

export class OrderApproved implements IEvent {
    public readonly type: string = "orderApproved";
    constructor(public readonly aggregateId: string) {}
}

export class OrderPaymentReceived implements IEvent {
    public readonly type: string = "orderPaymentReceived";
    constructor(public readonly aggregateId: string, public readonly paymentId: string, public readonly amount: number) {}
}

export class OrderPaid implements IEvent {
    public readonly type: string = "orderPaid";
    constructor(public readonly aggregateId: string) {}
}

export class OrderDispatched implements IEvent {
    public readonly type: string = "orderDispatched";
    constructor(public readonly aggregateId: string, public readonly shipmentId: string, public readonly carrier: string, public readonly carrierService: string) {}
}

export class OrderDelivered implements IEvent {
    public readonly type: string = "orderDelivered";
    constructor(public readonly aggregateId: string, public readonly shipmentId: string) {}
}

export class OrderCompleted implements IEvent {
    public readonly type: string = "orderCompleted";
    constructor(public readonly aggregateId: string) {}
}

// Integration Events
export class PaymentReceived implements IEvent {
    public readonly aggregateId: string;
    public readonly type: string = "paymentReceived";
    public readonly orderId: string;
    public readonly amount: number;
}

export class ShipmentDispatched implements IEvent {
    public readonly aggregateId: string;
    public readonly type: string = "shipmentDispatched";
    public readonly orderId: string;
    public readonly carrier: string;
    public readonly carrierService: string;
}

export class ShipmentDelivered implements IEvent {
    public readonly aggregateId: string;
    public readonly type: string = "shipmentDelivered";
    public readonly orderId: string;
}
