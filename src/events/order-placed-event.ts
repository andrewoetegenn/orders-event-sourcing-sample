import { OrderLineItem } from "../domain/order";
import { IEvent } from "./events";

export class OrderPlacedEvent implements IEvent {
    public readonly type: string = "OrderPlaced";

    constructor(
        public readonly aggregateId: string,
        public readonly lineItems: OrderLineItem[],
        public readonly orderTotal: number
    ) {}
}
