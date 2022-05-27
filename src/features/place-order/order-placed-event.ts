import { IEvent } from "../../core/event";

export class OrderPlaced implements IEvent {
    readonly aggregateId: string;

    constructor(aggregateId: string) {
        this.aggregateId = aggregateId;
    }
}
