import { Event } from "../events/events";

export abstract class Aggregate {
    protected _aggregateId: string;
    private _pendingEvents: Event[] = [];

    public getAggregateId = () => this._aggregateId;

    protected raiseEvent(event: Event): void {
        this._pendingEvents.push(event);
        this.apply(event);
    }

    protected abstract apply(event: Event): void;

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
