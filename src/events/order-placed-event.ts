import { OrderLineItem } from "../domain/order";
import { IEvent } from "../events/event";

export class OrderPlacedEvent implements IEvent {
    public readonly type: string;

    constructor(
        public readonly aggregateId: string,
        public readonly lineItems: OrderLineItem[],
        public readonly orderTotal: number
    ) {
        this.type = "OrderPlaced";
    }
}
