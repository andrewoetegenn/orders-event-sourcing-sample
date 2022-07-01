import { OrderLineItemAddedEvent } from "./order-line-item-added-event";
import { OrderPlacedEvent } from "./order-placed-event";

export interface IEvent {
    readonly aggregateId: string;
}

export type Event = OrderPlacedEvent | OrderLineItemAddedEvent;
