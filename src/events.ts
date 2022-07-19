import { OrderLineItem } from "./domain";

export interface IEvent {
    readonly aggregateId: string;
    readonly type: string;
}

// Domain Events
export class OrderPlaced implements IEvent {
    public readonly type: string = "OrderPlaced";
    constructor(public readonly aggregateId: string, public readonly lineItems: OrderLineItem[]) {}
}

export class LineItemAddedToOrder implements IEvent {
    public readonly type: string = "LineItemAddedToOrder";
    constructor(public readonly aggregateId: string, public readonly lineItem: OrderLineItem) {}
}

export class OrderApproved implements IEvent {
    public readonly type: string = "OrderApproved";
    constructor(public readonly aggregateId: string) {}
}

export class OrderPaymentReceived implements IEvent {
    public readonly type: string = "OrderPaymentReceived";
    constructor(public readonly aggregateId: string, public readonly paymentId: string, public readonly amount: number) {}
}

export class OrderCompleted implements IEvent {
    public readonly type: string = "OrderCompleted";
    constructor(public readonly aggregateId: string) {}
}

// Inbound Events
export class PaymentReceived implements IEvent {
    public readonly aggregateId: string;
    public readonly type: string = "PaymentReceived";
    public readonly orderId: string;
    public readonly amount: number;
}
