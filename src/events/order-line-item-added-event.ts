import { OrderLineItem } from "../domain/order";
import { IEvent } from "./events";

export class OrderLineItemAddedEvent implements IEvent {
    constructor(
        public readonly aggregateId: string,
        public readonly lineItem: OrderLineItem,
        public readonly orderTotal: number
    ) {}
}
