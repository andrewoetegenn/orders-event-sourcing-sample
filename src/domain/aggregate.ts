import { IEvent } from "../events/event";

export abstract class Aggregate {
    protected _aggregateId: string;
    private _pendingEvents: IEvent[] = [];

    public getAggregateId = () => this._aggregateId;

    protected raiseEvent(event: IEvent): void {
        this._pendingEvents.push(event);
        this.apply(event);
    }

    private apply(event: IEvent): void {
        if (!this[`apply${event.constructor.name}`]) {
            throw new Error(`No application found for event type ${event.constructor.name}.`);
        }

        this[`apply${event.constructor.name}`](event);
    }

    public getPendingEvents(): IEvent[] {
        return this._pendingEvents;
    }

    public markPendingEventsAsCommitted(): void {
        this._pendingEvents = [];
    }

    public loadFromHistory(events: IEvent[]): void {
        for (const event of events) {
            this.apply(event);
        }
    }
}
