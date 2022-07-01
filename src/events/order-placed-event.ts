import { OrderLineItem } from "../domain/order";
import { Event } from "../events/event";

export class OrderPlacedEvent extends Event {
    constructor(
        public readonly aggregateId: string,
        public readonly lineItems: OrderLineItem[],
        public readonly orderTotal: number
    ) {
        super(aggregateId);
    }
}
