import { OrderLineItem } from "../domain/order";
import { IEvent } from "../events/event";

export class OrderPlacedEvent implements IEvent {
    readonly aggregateId: string;
    readonly lineItems: OrderLineItem[];
    readonly orderTotal: number;

    constructor(id: string, lineItems: OrderLineItem[], orderTotal: number) {
        this.aggregateId = id;
        this.lineItems = lineItems;
        this.orderTotal = orderTotal;
    }
}
