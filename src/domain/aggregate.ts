import { IEvent } from "../events/events";

export abstract class Aggregate {
    protected _aggregateId: string;
    private _pendingEvents: IEvent[] = [];

    public getAggregateId = () => this._aggregateId;

    protected raiseEvent(event: IEvent): void {
        this._pendingEvents.push(event);
        this.apply(event);
    }

    protected abstract apply(event: IEvent): void;

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
