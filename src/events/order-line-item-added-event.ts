import { OrderLineItem } from "../domain/order";
import { IEvent } from "./events";

export class OrderLineItemAddedEvent implements IEvent {
    public readonly type: string;
    constructor(
        public readonly aggregateId: string,
        public readonly lineItem: OrderLineItem,
        public readonly orderTotal: number
    ) {
        this.type = "OrderLineItemAdded";
    }
}
