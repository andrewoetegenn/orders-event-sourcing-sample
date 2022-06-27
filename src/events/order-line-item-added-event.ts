import { OrderLineItem } from "../domain/order";
import { IEvent } from "./event";

export class OrderLineItemAddedEvent implements IEvent {
    readonly aggregateId: string;
    readonly lineItem: OrderLineItem;
    readonly orderTotal: number;

    constructor(id: string, lineItem: OrderLineItem, orderTotal: number) {
        this.aggregateId = id;
        this.lineItem = lineItem;
        this.orderTotal = orderTotal;
    }
}
