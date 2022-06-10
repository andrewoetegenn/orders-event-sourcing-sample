import { OrderLineItem } from "../../domain";
import { IEvent } from "../../events";

export class OrderPlaced implements IEvent {
    readonly id: string;
    readonly lineItems: OrderLineItem[];
    readonly orderTotal: number;

    constructor(id: string, lineItems: OrderLineItem[], orderTotal: number) {
        this.id = id;
        this.lineItems = lineItems;
        this.orderTotal = orderTotal;
    }
}
