import { OrderLineItem } from "../../domain";
import { IEvent } from "../../events";

export class OrderLineItemAdded implements IEvent {
    readonly id: string;
    readonly lineItem: OrderLineItem;
    readonly orderTotal: number;

    constructor(id: string, lineItem: OrderLineItem, orderTotal: number) {
        this.id = id;
        this.lineItem = lineItem;
        this.orderTotal = orderTotal;
    }
}
