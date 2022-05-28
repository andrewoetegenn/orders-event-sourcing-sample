import { IEvent } from "../core/event";

export class OrderPlaced implements IEvent {
    readonly aggregateId: string;
    readonly eventName: string;

    constructor(aggregateId: string) {
        this.aggregateId = aggregateId;
        this.eventName = "OrderPlaced";
    }
}
