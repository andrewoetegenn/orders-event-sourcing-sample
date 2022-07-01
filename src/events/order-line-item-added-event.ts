import { OrderLineItem } from "../domain/order";
import { Event } from "./event";

export class OrderLineItemAddedEvent extends Event {
    constructor(
        public readonly aggregateId: string,
        public readonly lineItem: OrderLineItem,
        public readonly orderTotal: number
    ) {
        super(aggregateId);
    }
}
