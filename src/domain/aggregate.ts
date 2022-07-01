import { Event } from "../events/event";

export abstract class Aggregate {
    protected _aggregateId: string;
    private _pendingEvents: Event[] = [];

    public getAggregateId = () => this._aggregateId;

    protected raiseEvent(event: Event): void {
        this._pendingEvents.push(event);
        this.apply(event);
    }

    private apply(event: Event): void {
        if (!this[`apply${event.constructor.name}`]) {
            throw new Error(`No application found for event type ${event.constructor.name}.`);
        }

        this[`apply${event.constructor.name}`](event);
    }

    public getPendingEvents(): Event[] {
        return this._pendingEvents;
    }

    public markPendingEventsAsCommitted(): void {
        this._pendingEvents = [];
    }

    public loadFromHistory(events: Event[]): void {
        for (const event of events) {
            this.apply(event);
        }
    }
}
