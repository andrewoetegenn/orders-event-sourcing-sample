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
