import { OrderLineItem } from "./domain";

export interface IEvent {
    readonly aggregateId: string;
    readonly type: string;
}

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
