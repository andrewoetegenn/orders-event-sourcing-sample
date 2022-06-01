import { OrderLineItem } from "../../domain";
import { IEvent } from "../../events";

export class OrderPlaced implements IEvent {
    readonly id: string;
    readonly lineItems: OrderLineItem[];

    constructor(id: string, lineItems: OrderLineItem[]) {
        this.id = id;
        this.lineItems = lineItems;
    }
}
